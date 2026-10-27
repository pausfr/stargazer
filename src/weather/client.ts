/**
 * 외부 날씨 API 어댑터 (SD2·SD3, BR2.1·BR2.2·BR4.1).
 *
 * Open-Meteo(키 불필요 공개 API)를 fetch + AbortController 타임아웃으로
 * 호출한다. 응답을 비신뢰 경계 데이터로 취급해, 파싱·검증을 통과한
 * 뒤에만 known 으로 정규화한다(SD2). 실패/타임아웃/파싱불가/구름량 결측은
 * unknown(reason에 내부 사유)으로 정규화하며, 외부 원형 응답/오류를
 * 호출부에 노출하지 않는다(BR2.2). 비밀값·키는 쓰지 않는다(SD3).
 */

import {
  knownForecast,
  unknownForecast,
  type CloudForecast,
  type CloudForecastQuery,
  type HourlyCloud,
} from './types.js';

/** fetch 주입 시그니처. 기본은 전역 fetch(테스트는 페이크로 대체). */
export type FetchLike = (
  input: string,
  init?: { signal?: AbortSignal },
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

/** WeatherClient 생성 옵션. */
export interface WeatherClientOptions {
  /** 주입 fetch(기본 전역 fetch). */
  fetchImpl?: FetchLike;
  /** 호출 타임아웃(ms, 기본 5초, BR4.1). */
  timeoutMs?: number;
}

/** Open-Meteo forecast 엔드포인트(키 불필요, SD3). */
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

/** 기본 타임아웃(수 초, BR4.1). */
const DEFAULT_TIMEOUT_MS = 5000;

/** YYYY-MM-DD 날짜 키의 다음날을 구한다(UTC 달력 기준, KST 날짜 롤오버 무해). */
function nextDateKstId(dateKstId: string): string {
  const [y, m, d] = dateKstId.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const yy = next.getUTCFullYear().toString().padStart(4, '0');
  const mm = (next.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = next.getUTCDate().toString().padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * 그날 밤(저녁~다음날 새벽)을 모두 덮도록 **그날과 다음날** 이틀치 시간별
 * cloud_cover 쿼리 URL을 만든다. 하루치(start=end=그날)만 받으면 자정을
 * 넘어가는 새벽 구간(00~06시)에 구름 데이터가 없어 그래프가 23시에서
 * 끊겼다 — end_date를 다음날로 확장해 밤 전체를 덮는다.
 */
function buildUrl(query: CloudForecastQuery): string {
  const params = new URLSearchParams({
    latitude: String(query.lat),
    longitude: String(query.lon),
    hourly: 'cloud_cover',
    timezone: 'Asia/Seoul',
    start_date: query.dateKstId,
    end_date: nextDateKstId(query.dateKstId),
  });
  return `${OPEN_METEO_BASE}?${params.toString()}`;
}

/** Open-Meteo 응답 시각 형식(오프셋 없는 로컬 벽시계). 예: "2026-10-29T00:00". */
const BARE_LOCAL_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * Open-Meteo가 돌려주는 오프셋 없는 벽시계 시각 문자열에 KST 오프셋을
 * 명시적으로 붙인다(C2 계약: hourKst는 "ISO 시각(KST)"이어야 함).
 *
 * 결함 수정: 요청 시 timezone=Asia/Seoul을 지정해 응답 시각은 이미 KST
 * 벽시계값이지만, 오프셋이 없는 문자열(예: "2026-10-29T00:00")을 그대로
 * Date.parse하면 JS가 이를 UTC로 해석해 9시간이 밀린다. 그 결과 밤 구간
 * 집계(aggregateNightCloudPct)가 엉뚱한 시간대를 보거나 구간을 놓쳐
 * 구름량이 표시되지 않는 원인이 됐다. +09:00을 명시해 교정한다.
 */
function normalizeToKstIso(rawTime: string): string {
  if (BARE_LOCAL_TIME_RE.test(rawTime)) {
    return `${rawTime}:00+09:00`;
  }
  return rawTime; // 이미 오프셋이 있으면 그대로(상위 호환).
}

/**
 * Open-Meteo 응답(비신뢰)에서 시간별 구름량을 추출·검증한다.
 * 형식이 예상과 다르거나 구름량이 비어 있으면 null(결측).
 */
function parseHourlyCloud(payload: unknown): HourlyCloud[] | null {
  if (payload === null || typeof payload !== 'object') {
    return null;
  }
  const hourly = (payload as { hourly?: unknown }).hourly;
  if (hourly === null || typeof hourly !== 'object') {
    return null;
  }
  const times = (hourly as { time?: unknown }).time;
  const clouds = (hourly as { cloud_cover?: unknown }).cloud_cover;
  if (!Array.isArray(times) || !Array.isArray(clouds) || times.length === 0) {
    return null;
  }
  if (times.length !== clouds.length) {
    return null;
  }

  const result: HourlyCloud[] = [];
  for (let i = 0; i < times.length; i += 1) {
    const rawTime = times[i];
    const cloudPct = clouds[i];
    if (typeof rawTime !== 'string') {
      return null;
    }
    if (typeof cloudPct !== 'number' || Number.isNaN(cloudPct)) {
      // 특정 시각 결측은 건너뛰지 않고 전체를 결측으로 본다(보수적, BR2.1).
      return null;
    }
    result.push({ hourKst: normalizeToKstIso(rawTime), cloudPct });
  }
  return result.length > 0 ? result : null;
}

/**
 * 외부 날씨 API 어댑터. 호출부는 3-상태 CloudForecast만 본다(BR2.2).
 */
export class WeatherClient {
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;

  constructor(options: WeatherClientOptions = {}) {
    // 기본 전역 fetch(Node 18+/브라우저 내장). 비밀값·키 없음(SD3).
    // 반드시 globalThis에 bind한다: 브라우저의 fetch는 this가 window(globalThis)가
    // 아니면 "Illegal invocation" TypeError를 동기적으로 던진다. 변수로 떼어
    // 호출하면(this=WeatherClient 인스턴스) 네트워크 요청이 시작조차 안 되고
    // 즉시 예외 → 모든 날짜가 unknown으로 떨어져 구름량이 영영 안 나왔다.
    const defaultFetch = globalThis.fetch.bind(globalThis) as unknown as FetchLike;
    this.fetchImpl = options.fetchImpl ?? defaultFetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * 14일 이내 요청에 대해 외부 API를 호출해 구름량을 가져온다(BR1.2).
   *
   * 성공 + 구름량 존재 → known. 그 외(실패/타임아웃/파싱불가/결측) →
   * unknown(reason에 내부 사유, BR2.1). 예외를 던지지 않는다(C2 throws:never).
   *
   * @param query 검증을 통과한 조회 입력.
   */
  async fetchCloudForecast(query: CloudForecastQuery): Promise<CloudForecast> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(buildUrl(query), { signal: controller.signal });
      if (!response.ok) {
        return unknownForecast(query.dateKstId, `http ${response.status}`);
      }
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return unknownForecast(query.dateKstId, 'unparseable response');
      }
      const hourly = parseHourlyCloud(payload);
      if (hourly === null) {
        return unknownForecast(query.dateKstId, 'cloud cover missing');
      }
      return knownForecast(query.dateKstId, hourly);
    } catch (error) {
      // 타임아웃(abort) 포함 모든 호출 실패. 외부 오류는 비노출, 내부 사유만 기록.
      const reason =
        error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'fetch failed';
      return unknownForecast(query.dateKstId, reason);
    } finally {
      clearTimeout(timer);
    }
  }
}
