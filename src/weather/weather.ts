/**
 * 구름량 예보 오케스트레이션 (WF1, BR1.1·BR1.2·BR1.3·BR2.1·BR3.1·BR3.2).
 *
 * getCloudForecast가 유일한 공개 진입점이다(C2). 검증 게이트 → 캐시 조회
 * → 14일 사전 컷오프 → 14일 이내 외부 호출 → TTL 캐시 순으로 흐른다.
 * u2는 자동 재시도하지 않는다(BR3.2). 시각·fetch·캐시는 주입 가능해
 * 테스트 결정성을 확보한다(실시간 Date.now()·네트워크 의존 없음).
 */

import { DataCache, cacheKey, ttlForForecast } from './cache.js';
import { WeatherClient, type FetchLike } from './client.js';
import { isValidQuery } from './validation.js';
import {
  FORECAST_HORIZON_DAYS,
  outOfHorizonForecast,
  unknownForecast,
  type CloudForecast,
  type CloudForecastQuery,
} from './types.js';

/** KST 고정 오프셋(UTC+9). 한국은 서머타임이 없다. */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 다음 KST 자정까지 남은 시간(ms)을 구한다.
 *
 * outOfHorizon 판정은 "오늘 KST"에 의존하므로(BR1.1), 그 결과의 캐시 수명은
 * 자정을 넘어서는 안 된다. 자정을 넘기면 같은 날짜가 지평 안으로 들어올 수
 * 있어 stale outOfHorizon을 돌려줄 위험이 있다(리뷰 Minor 수정).
 */
function msUntilNextKstMidnight(nowMs: number): number {
  const kstMs = nowMs + KST_OFFSET_MS;
  const msIntoDay = ((kstMs % ONE_DAY_MS) + ONE_DAY_MS) % ONE_DAY_MS;
  return ONE_DAY_MS - msIntoDay;
}

/** getCloudForecast 주입 의존성. 테스트는 모두 주입해 결정적으로 만든다. */
export interface GetCloudForecastDeps {
  /** 현재 시각(epoch ms, 주입). 컷오프·TTL 판정 기준. */
  nowMs: number;
  /** 세션 범위 캐시(주입, 기본 새 DataCache는 호출마다 무의미하므로 호출부가 재사용). */
  cache: DataCache;
  /** 외부 호출 어댑터(주입). */
  client: WeatherClient;
}

/** deps를 일부만 넘길 때 기본값을 채워 완성한다(편의). */
export interface GetCloudForecastOptions {
  nowMs?: number;
  cache?: DataCache;
  client?: WeatherClient;
  /** client 미주입 시 WeatherClient에 넘길 fetch(기본 전역). */
  fetchImpl?: FetchLike;
}

/**
 * 요청 날짜가 (오늘 KST + FORECAST_HORIZON_DAYS)를 넘는지 판정한다(BR1.1).
 *
 * 날짜 비교는 KST 달력 일(day) 기준으로 한다: 오늘 KST의 day 인덱스와
 * 요청 dateKstId의 day 인덱스를 epoch-day로 환산해 차이가 컷오프를 넘으면
 * outOfHorizon이다. 시각 세부에 흔들리지 않는 결정적 비교.
 */
function isBeyondHorizon(dateKstId: string, nowMs: number): boolean {
  const todayKstDay = Math.floor((nowMs + KST_OFFSET_MS) / ONE_DAY_MS);
  const [y, m, d] = dateKstId.split('-').map(Number);
  const requestDay = Math.floor(Date.UTC(y, m - 1, d) / ONE_DAY_MS);
  return requestDay - todayKstDay > FORECAST_HORIZON_DAYS;
}

/**
 * WF1: 한 날짜·좌표의 구름량 예보를 3-상태로 반환한다(C2).
 *
 * 흐름:
 * 1. 검증 게이트(실패 → unknown reason="invalid input", 외부 호출 없음, SD1).
 * 2. 캐시 조회(히트 → 반환, BR3.1).
 * 3. 14일 사전 컷오프(초과 → 호출 없이 outOfHorizon, 긴 TTL 캐시, BR1.1).
 * 4. 14일 이내 → WeatherClient 호출(known/unknown, BR1.2·BR2.1).
 * 5. 결과를 상태별 TTL로 캐시 후 반환(BR3.1). 자동 재시도 없음(BR3.2).
 *
 * @param query 조회 입력(날짜·좌표).
 * @param options 주입 의존성(nowMs·cache·client·fetchImpl).
 */
export async function getCloudForecast(
  query: CloudForecastQuery,
  options: GetCloudForecastOptions = {},
): Promise<CloudForecast> {
  const nowMs = options.nowMs ?? Date.now();
  const cache = options.cache ?? new DataCache();
  const client = options.client ?? new WeatherClient({ fetchImpl: options.fetchImpl });

  // 1. 검증 게이트(fail-fast, 외부 호출 없음).
  if (!isValidQuery(query)) {
    // 유효하지 않은 입력: 캐시도 외부 호출도 하지 않고 즉시 unknown.
    return unknownForecast(query?.dateKstId ?? '', 'invalid input');
  }

  const key = cacheKey(query.dateKstId, query.lat, query.lon);

  // 2. 캐시 조회.
  const cached = cache.get(key, nowMs);
  if (cached !== null) {
    return cached;
  }

  // 3. 14일 사전 컷오프(호출 없이 outOfHorizon).
  if (isBeyondHorizon(query.dateKstId, nowMs)) {
    const forecast = outOfHorizonForecast(query.dateKstId);
    // outOfHorizon 판정은 "오늘 KST"에 의존하므로, 캐시 수명은 긴 TTL과
    // "다음 자정까지" 중 짧은 쪽으로 제한한다(자정 교차 stale 방지, 리뷰 Minor).
    const ttlMs = Math.min(ttlForForecast(forecast), msUntilNextKstMidnight(nowMs));
    cache.set(key, forecast, ttlMs, nowMs);
    return forecast;
  }

  // 4. 14일 이내 외부 호출.
  const forecast = await client.fetchCloudForecast(query);

  // 5. 상태별 TTL로 캐시 후 반환.
  cache.set(key, forecast, ttlForForecast(forecast), nowMs);
  return forecast;
}
