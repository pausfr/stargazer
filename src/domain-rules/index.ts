/**
 * u3-domain-rules 공개 API (C3).
 *
 * listCandidateDates(달력 산출)와 recommend(추천 판정)가 공개 진입점이다.
 * 공개 타입과 정책 상수를 함께 재노출한다. 내부 구현(공휴일 테이블·
 * 집계·검증)은 캡슐화해 노출하지 않는다. 순수·결정적, 네트워크 없음.
 */

export { listCandidateDates } from './calendar.js';
export { recommend, verdictSortKey } from './recommend.js';

export type {
  DateRange,
  CalendarDate,
  HolidayCoverage,
  Recommendation,
  RecommendationVerdict,
  AstronomyResult,
  CloudForecast,
} from './types.js';

export {
  MOON_ILLUMINATION_MAX_PCT,
  CLOUD_MAX_PCT,
  HOLIDAY_TABLE_FROM_YEAR,
  HOLIDAY_TABLE_TO_YEAR,
} from './constants.js';
