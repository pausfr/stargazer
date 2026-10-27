/**
 * NightView 조립 (functional-spec §2·§2.1·§5.1, PD1·PD3).
 *
 * 한 날짜(CalendarDate)의 표시 단위를 상위 계약(U1·U2·U3)을 점진 호출해
 * 조립한다. 즉시 단계로 동기 천문 계산을, 지연 단계로 비동기 구름 예보를
 * 수행하고, 추천 판정과 상태 매핑으로 NightView를 완성한다.
 *
 * 결정성·테스트성을 위해 U1/U2/U3 함수와 공유 cache·nowMs를 모두 주입받는다
 * (기본값은 실제 단위 함수). astro throw는 error 상태로 격리한다(§5).
 */

import { computeAstronomy as defaultComputeAstronomy } from '../astronomy/index.js';
import { AstronomyComputationError } from '../astronomy/index.js';
import { getCloudForecast as defaultGetCloudForecast } from '../weather/index.js';
import type { DataCache } from '../weather/index.js';
import { recommend as defaultRecommend } from '../domain-rules/index.js';
import type { AstronomyInput } from '../astronomy/index.js';
import type { CloudForecastQuery } from '../weather/index.js';
import { mapState } from './state.js';
import {
  DEFAULT_LOCATION,
  type AstronomyResult,
  type CalendarDate,
  type CloudForecast,
  type NightView,
  type Recommendation,
} from './types.js';

/** 조립이 주입받는 상위 단위 함수(테스트는 mock으로 대체). */
export interface AssemblerDeps {
  /** U1: 동기 천문 계산. 드물게 AstronomyComputationError throw. */
  computeAstronomy: (input: AstronomyInput) => AstronomyResult;
  /** U2: 비동기 구름 예보(status로 성공/먼 날짜/실패 구분, 예외 없음). */
  getCloudForecast: (
    query: CloudForecastQuery,
    options: { nowMs: number; cache: DataCache },
  ) => Promise<CloudForecast>;
  /** U3: 동기 추천 판정. */
  recommend: (astro: AstronomyResult, cloud: CloudForecast) => Recommendation;
}

/** 조립 런타임 컨텍스트(공유 캐시·기준 시각·좌표). */
export interface AssembleContext {
  /** 세션 공유 DataCache 단일 인스턴스(PD3). */
  cache: DataCache;
  /** 기준 시각(epoch ms). outOfHorizon 컷오프·TTL을 결정적으로 만든다. */
  nowMs: number;
  /** 좌표(기본 DEFAULT_LOCATION). */
  lat?: number;
  lon?: number;
}

const defaultDeps: AssemblerDeps = {
  computeAstronomy: defaultComputeAstronomy,
  getCloudForecast: defaultGetCloudForecast,
  recommend: defaultRecommend,
};

/**
 * 한 CalendarDate를 NightView로 조립한다(functional-spec §2.1).
 *
 * 흐름:
 * 1. 즉시: computeAstronomy({ dateKstId, lat, lon, nightStartKst, nightEndKst })
 *    — 밤 범위를 반드시 전달(§2.1). throw면 error로 격리.
 * 2. 지연: await getCloudForecast({ dateKstId, lat, lon }, { nowMs, cache })
 *    — 공유 cache·nowMs 주입(PD3).
 * 3. recommend(astro, cloud)로 판정, mapState로 상태 산출.
 *
 * @param calendar 조립 대상 후보 날짜.
 * @param ctx 공유 캐시·기준 시각·좌표.
 * @param deps 주입 단위 함수(기본은 실제 U1/U2/U3).
 */
export async function assembleNightView(
  calendar: CalendarDate,
  ctx: AssembleContext,
  deps: AssemblerDeps = defaultDeps,
): Promise<NightView> {
  const lat = ctx.lat ?? DEFAULT_LOCATION.lat;
  const lon = ctx.lon ?? DEFAULT_LOCATION.lon;
  const dateKstId = calendar.dateKstId;

  // 1. 즉시 단계: 천문 계산(밤 범위 전달 필수, §2.1). throw는 error로 격리.
  let astro: AstronomyResult | null = null;
  let astroError = false;
  try {
    astro = deps.computeAstronomy({
      dateKstId,
      lat,
      lon,
      nightStartKst: calendar.nightStartKst,
      nightEndKst: calendar.nightEndKst,
    });
  } catch (err) {
    // 천문 실패는 핵심 → error. 내부 code는 읽지 않고 격리만 한다(SD3).
    astroError = err instanceof AstronomyComputationError || err instanceof Error;
    astro = null;
  }

  // 2. 지연 단계: 구름 예보(공유 cache·nowMs 주입, PD3).
  const cloud = await deps.getCloudForecast(
    { dateKstId, lat, lon },
    { nowMs: ctx.nowMs, cache: ctx.cache },
  );

  // 3. 추천 판정(천문 성공 시에만)과 상태 매핑.
  const verdict = astro !== null ? deps.recommend(astro, cloud) : null;
  const state = mapState(astro, cloud);

  return { dateKstId, calendar, astro, astroError, cloud, verdict, state };
}
