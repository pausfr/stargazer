/**
 * 테스트 공용 픽스처 (u4-web-ui 단위 테스트).
 *
 * mock U1/U2/U3 입력을 결정적으로 만들기 위한 고정 객체 팩토리. 외부 날씨
 * API는 절대 호출하지 않으며, 모든 값은 상위 계약 타입 형태를 따른다.
 */

import type { AstronomyResult, MoonHourlySample } from '../../astronomy/index.js';
import type { CloudForecast, HourlyCloud } from '../../weather/index.js';
import type { CalendarDate, Recommendation } from '../../domain-rules/index.js';

/** 결정적 시간별 체감 밝기 샘플(월출→남중→하강 형태). */
export function makeMoonHourly(): MoonHourlySample[] {
  return [
    { hourKst: '2026-01-01T18:00:00+09:00', altitudeDeg: -2, relativeBrightnessPct: 0 },
    { hourKst: '2026-01-01T19:00:00+09:00', altitudeDeg: 6, relativeBrightnessPct: 8 },
    { hourKst: '2026-01-01T21:00:00+09:00', altitudeDeg: 25, relativeBrightnessPct: 45 },
    { hourKst: '2026-01-01T23:00:00+09:00', altitudeDeg: 42, relativeBrightnessPct: 100 },
    { hourKst: '2026-01-02T01:00:00+09:00', altitudeDeg: 24, relativeBrightnessPct: 43 },
    { hourKst: '2026-01-02T03:00:00+09:00', altitudeDeg: 5, relativeBrightnessPct: 6 },
    { hourKst: '2026-01-02T05:00:00+09:00', altitudeDeg: -8, relativeBrightnessPct: 0 },
  ];
}

/**
 * 실제 천문 관계를 반영한 경계값. 각 박명의 start/end는 일몰(0도)을 공통
 * 기준으로 한 교차점이라 civil.start < nautical.start < astronomical.start로
 * 떨어져 있고, astronomical.start === fullDarkStart, astronomical.end ===
 * fullDarkEnd다(완전한 밤 = 천문박명 -18도 교차 구간 그 자체). 이로써 7밴드가
 * 틈 없이 연속된다.
 */
export function makeAstro(overrides: Partial<AstronomyResult> = {}): AstronomyResult {
  return {
    dateKstId: '2026-01-01',
    moonIlluminationPct: 10,
    moonHourly: makeMoonHourly(),
    civilTwilight: { start: '2026-01-01T18:02:00+09:00', end: '2026-01-02T06:29:00+09:00' },
    nauticalTwilight: { start: '2026-01-01T18:33:00+09:00', end: '2026-01-02T05:58:00+09:00' },
    astronomicalTwilight: { start: '2026-01-01T19:03:00+09:00', end: '2026-01-02T05:28:00+09:00' },
    fullDarkStart: '2026-01-01T19:03:00+09:00',
    fullDarkEnd: '2026-01-02T05:28:00+09:00',
    moonrise: '2026-01-01T20:00:00+09:00',
    moonset: '2026-01-02T07:00:00+09:00',
    nightStart: '2026-01-01T17:30:00+09:00',
    nightEnd: '2026-01-02T07:01:00+09:00',
    ...overrides,
  };
}

export function makeHourly(): HourlyCloud[] {
  return [
    { hourKst: '2026-01-01T19:00:00+09:00', cloudPct: 10 },
    { hourKst: '2026-01-01T22:00:00+09:00', cloudPct: 20 },
    { hourKst: '2026-01-02T02:00:00+09:00', cloudPct: 15 },
  ];
}

export function makeCloudKnown(overrides: Partial<CloudForecast> = {}): CloudForecast {
  return {
    dateKstId: '2026-01-01',
    status: 'known',
    hourlyCloudPct: makeHourly(),
    reason: null,
    ...overrides,
  };
}

export function makeCloudOutOfHorizon(dateKstId = '2026-01-01'): CloudForecast {
  return { dateKstId, status: 'outOfHorizon', hourlyCloudPct: null, reason: null };
}

export function makeCloudUnknown(
  dateKstId = '2026-01-01',
  reason = 'internal failure',
): CloudForecast {
  return { dateKstId, status: 'unknown', hourlyCloudPct: null, reason };
}

export function makeCalendar(overrides: Partial<CalendarDate> = {}): CalendarDate {
  return {
    dateKstId: '2026-01-01',
    label: '신정',
    isHoliday: true,
    isWeekend: false,
    holidayCoverage: 'covered',
    nightStartKst: '2026-01-01T18:00:00+09:00',
    nightEndKst: '2026-01-02T06:00:00+09:00',
    ...overrides,
  };
}

export function makeRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    dateKstId: '2026-01-01',
    verdict: 'recommended',
    reason: null,
    moonIlluminationPct: 10,
    cloudConsidered: true,
    ...overrides,
  };
}
