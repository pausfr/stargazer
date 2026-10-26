/**
 * u2-weather-data 공개 타입 (C2 계약 반영).
 *
 * 구름량 예보 결과 CloudForecast는 3-상태(known/outOfHorizon/unknown)로
 * 정규화된다(C2, BR2.2). 상태별 불변식은 생성 헬퍼로 타입·런타임에서
 * 함께 보장한다. 외부 API의 원형 응답/타입은 이 모듈을 통해 노출하지
 * 않는다(어댑터 경계, BR2.2).
 */

/**
 * 예보 지평 사전 컷오프 상수(BR1.1·BR1.3).
 *
 * 불변식(BR1.3): FORECAST_HORIZON_DAYS 는 실제 날씨 API의 예보 범위와
 * 같거나 그보다 작아야 한다. 1순위 API인 Open-Meteo 의 forecast 범위는
 * 최대 16일이므로 14 ≤ 16 으로 이 불변식이 성립한다. 이 불변식이
 * outOfHorizon(컷오프 초과)과 unknown(컷오프 이내의 실패/결측)을 겹치지
 * 않게 만든다.
 */
export const FORECAST_HORIZON_DAYS = 14;

/** 구름 예보 상태 3분류(C2). */
export type CloudStatus = 'known' | 'outOfHorizon' | 'unknown';

/** 시간별 구름량 한 점. */
export interface HourlyCloud {
  /** ISO 시각(KST). */
  hourKst: string;
  /** 구름량 %, [0, 100]. */
  cloudPct: number;
}

/**
 * 한 날짜·좌표의 구름량 예보 결과. dateKstId로 식별(C2).
 *
 * 상태 불변식(entities.md constraints):
 * - status=known       → hourlyCloudPct 채워짐, reason=null.
 * - status=outOfHorizon → hourlyCloudPct=null, reason=null(정상적 '먼 날짜').
 * - status=unknown      → hourlyCloudPct=null, reason에 내부 사유(로그 전용).
 *
 * reason은 내부 사유이며 UI에 노출하지 않는다(BR2.1).
 */
export interface CloudForecast {
  /** 입력 dateKstId를 그대로 반영. */
  dateKstId: string;
  /** 3-상태 중 하나(C2). */
  status: CloudStatus;
  /** status=known일 때만 채워짐. 그 외 null. */
  hourlyCloudPct: HourlyCloud[] | null;
  /** status=unknown일 때 내부 사유(로그 전용, UI 비노출). 그 외 null. */
  reason: string | null;
}

/** 구름량 예보 조회 입력. 날짜 키와 전국 대표 좌표. */
export interface CloudForecastQuery {
  /** KST 날짜 키, 형식 YYYY-MM-DD. */
  dateKstId: string;
  /** 위도(도), [-90, 90]. */
  lat: number;
  /** 경도(도), [-180, 180]. */
  lon: number;
}

/** DataCache의 한 항목. 조회 결과를 TTL과 함께 보관(BR3.1). */
export interface CacheEntry {
  /** dateKstId + lat + lon 조합. */
  cacheKey: string;
  /** 보관된 예보 결과. */
  forecast: CloudForecast;
  /** 저장 시각(epoch ms). */
  storedAtMs: number;
  /** 유효 기간(ms). known/outOfHorizon은 길게, unknown은 짧게. */
  ttlMs: number;
}

/**
 * known 상태 CloudForecast를 생성한다(불변식: reason=null).
 *
 * @param dateKstId 날짜 키.
 * @param hourlyCloudPct 시간별 구름량(비어 있지 않아야 의미 있음).
 */
export function knownForecast(dateKstId: string, hourlyCloudPct: HourlyCloud[]): CloudForecast {
  return { dateKstId, status: 'known', hourlyCloudPct, reason: null };
}

/**
 * outOfHorizon 상태 CloudForecast를 생성한다(불변식: hourly=null, reason=null).
 *
 * 예보 지평(14일)을 넘긴 정상적 '먼 날짜'에 해당한다(BR1.1).
 */
export function outOfHorizonForecast(dateKstId: string): CloudForecast {
  return { dateKstId, status: 'outOfHorizon', hourlyCloudPct: null, reason: null };
}

/**
 * unknown 상태 CloudForecast를 생성한다(불변식: hourly=null, reason 존재).
 *
 * 14일 이내의 호출 실패/타임아웃/파싱불가/구름량 결측을 정규화한다(BR2.1).
 *
 * @param dateKstId 날짜 키.
 * @param reason 내부 사유(로그 전용, UI 비노출).
 */
export function unknownForecast(dateKstId: string, reason: string): CloudForecast {
  return { dateKstId, status: 'unknown', hourlyCloudPct: null, reason };
}
