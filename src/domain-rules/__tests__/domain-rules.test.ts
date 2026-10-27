/**
 * u3-domain-rules 단위 테스트 (test-after).
 *
 * 순수 규칙 라이브러리이므로 외부 네트워크 없이 입력 주입만으로
 * 결정적으로 검증한다. 공휴일 테이블(BR1.5)·달력 산출(BR1.1~BR1.4)·
 * 추천 판정(BR2.1~BR2.6)·분기 우선순위(SD1)를 다룬다. recommend는
 * AstronomyResult·CloudForecast 고정 객체를 입력으로 받는다(U1·U2
 * 실제 호출 불필요).
 */

import { describe, expect, it } from 'vitest';

import {
  CLOUD_MAX_PCT,
  HOLIDAY_TABLE_FROM_YEAR,
  HOLIDAY_TABLE_TO_YEAR,
  MOON_ILLUMINATION_MAX_PCT,
} from '../constants.js';
import { holidayCoverageFor, holidayName, isHoliday, isYearCovered } from '../holidays.js';
import { listCandidateDates } from '../calendar.js';
import { recommend, verdictSortKey } from '../recommend.js';
import type { AstronomyResult, CloudForecast, DateRange } from '../types.js';

// --- 고정 입력 빌더 ---------------------------------------------------------

function astroWith(overrides: Partial<AstronomyResult> = {}): AstronomyResult {
  return {
    dateKstId: '2026-11-17',
    moonIlluminationPct: 10,
    moonHourly: [],
    civilTwilight: { start: null, end: null },
    nauticalTwilight: { start: null, end: null },
    astronomicalTwilight: { start: null, end: null },
    fullDarkStart: '2026-11-17T19:00:00+09:00',
    fullDarkEnd: '2026-11-18T05:00:00+09:00',
    moonrise: null,
    moonset: null,
    nightStart: '2026-11-17T17:30:00+09:00',
    nightEnd: '2026-11-18T07:00:00+09:00',
    ...overrides,
  };
}

function knownCloud(cloudPcts: number[], dateKstId = '2026-11-17'): CloudForecast {
  return {
    dateKstId,
    status: 'known',
    hourlyCloudPct: cloudPcts.map((pct, i) => ({
      hourKst: `2026-11-17T${String(19 + i).padStart(2, '0')}:00:00+09:00`,
      cloudPct: pct,
    })),
    reason: null,
  };
}

function outOfHorizonCloud(dateKstId = '2026-11-17'): CloudForecast {
  return { dateKstId, status: 'outOfHorizon', hourlyCloudPct: null, reason: null };
}

function unknownCloud(dateKstId = '2026-11-17'): CloudForecast {
  return { dateKstId, status: 'unknown', hourlyCloudPct: null, reason: 'timeout' };
}

// --- 공휴일 테이블 (BR1.5) ---------------------------------------------------

describe('holidays (BR1.5)', () => {
  it('커버 범위 안 법정공휴일을 적중한다', () => {
    expect(isHoliday('2026-03-01')).toBe(true); // 삼일절
    expect(holidayName('2026-03-01')).toBe('삼일절');
  });

  it('대체공휴일을 적중한다', () => {
    expect(isHoliday('2026-03-02')).toBe(true); // 삼일절 대체공휴일
    expect(holidayName('2026-03-02')).toBe('대체공휴일');
  });

  it('커버 범위 안 평일 비공휴일은 공휴일이 아니다', () => {
    expect(isHoliday('2026-05-04')).toBe(false);
    expect(holidayName('2026-05-04')).toBeNull();
  });

  it('커버 범위(fromYear-1) 밖 연도는 outOfTable이며 공휴일 판정하지 않는다', () => {
    const before = `${HOLIDAY_TABLE_FROM_YEAR - 1}-01-01`;
    expect(holidayCoverageFor(before)).toBe('outOfTable');
    expect(isHoliday(before)).toBe(false);
    expect(holidayName(before)).toBeNull();
  });

  it('커버 범위(toYear+1) 밖 연도는 outOfTable이며 공휴일 판정하지 않는다', () => {
    const after = `${HOLIDAY_TABLE_TO_YEAR + 1}-01-01`;
    expect(holidayCoverageFor(after)).toBe('outOfTable');
    expect(isHoliday(after)).toBe(false);
  });

  it('isYearCovered는 경계(fromYear·toYear 포함)를 올바르게 판정한다', () => {
    expect(isYearCovered(HOLIDAY_TABLE_FROM_YEAR)).toBe(true);
    expect(isYearCovered(HOLIDAY_TABLE_TO_YEAR)).toBe(true);
    expect(isYearCovered(HOLIDAY_TABLE_FROM_YEAR - 1)).toBe(false);
    expect(isYearCovered(HOLIDAY_TABLE_TO_YEAR + 1)).toBe(false);
  });

  it('2026 추석(9/26 토 겹침)의 대체공휴일 9/28(월)을 수록한다(토·일 겹침 대체 규칙 일관성)', () => {
    // 광복절(8/17)·개천절(10/5)과 동일 기준: 공휴일이 토·일과 겹치면 다음
    // 평일에 대체공휴일을 둔다. 추석에도 같은 규칙을 적용.
    expect(isHoliday('2026-09-28')).toBe(true);
    expect(holidayName('2026-09-28')).toBe('대체공휴일');
  });
});

// --- 달력 listCandidateDates (BR1.1~BR1.4, SD1) ------------------------------

describe('listCandidateDates (BR1.1~BR1.4)', () => {
  it('3개월 범위의 주말·공휴일을 날짜순으로 산출한다', () => {
    const dates = listCandidateDates({ fromKstId: '2026-05-01', months: 3 });
    expect(dates.length).toBeGreaterThan(0);
    // 날짜순 정렬 보장.
    const ids = dates.map((d) => d.dateKstId);
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
    // 어린이날(2026-05-05)은 공휴일 후보로 포함.
    const childrensDay = dates.find((d) => d.dateKstId === '2026-05-05');
    expect(childrensDay?.isHoliday).toBe(true);
    expect(childrensDay?.label).toBe('어린이날');
  });

  it('각 후보에 KST 밤 범위(저녁~다음날 새벽)를 부여한다(BR1.3)', () => {
    const dates = listCandidateDates({ fromKstId: '2026-05-01', months: 3 });
    const sat = dates.find((d) => d.dateKstId === '2026-05-02');
    expect(sat?.nightStartKst).toBe('2026-05-02T18:00:00+09:00');
    expect(sat?.nightEndKst).toBe('2026-05-03T06:00:00+09:00');
  });

  it('연속된 주말을 하나의 묶음(holidayGroupId)으로, 라벨은 주말로 둔다(BR1.4·BR1.2)', () => {
    const dates = listCandidateDates({ fromKstId: '2026-05-01', months: 3 });
    const sat = dates.find((d) => d.dateKstId === '2026-05-02'); // 토
    const sun = dates.find((d) => d.dateKstId === '2026-05-03'); // 일
    expect(sat?.holidayGroupId).toBeDefined();
    expect(sat?.holidayGroupId).toBe(sun?.holidayGroupId);
    expect(sat?.label).toBe('주말');
  });

  it('연속 공휴일(삼일절 일요일 + 대체공휴일 월요일)을 한 묶음으로 묶고 공휴일명을 라벨로 쓴다(BR1.4)', () => {
    const dates = listCandidateDates({ fromKstId: '2026-02-01', months: 3 });
    const mar1 = dates.find((d) => d.dateKstId === '2026-03-01'); // 일, 삼일절
    const mar2 = dates.find((d) => d.dateKstId === '2026-03-02'); // 월, 대체공휴일
    expect(mar1).toBeDefined();
    expect(mar2).toBeDefined();
    expect(mar1?.holidayGroupId).toBe(mar2?.holidayGroupId);
    expect(mar1?.label).toBe('삼일절');
    expect(mar2?.label).toBe('삼일절'); // 묶음 라벨은 그룹 내 첫 공휴일명
  });

  it('공휴일이 없는 월말 범위라도 주말만으로 후보를 구성한다(BR1.2)', () => {
    const dates = listCandidateDates({ fromKstId: '2026-06-01', months: 3 });
    expect(dates.length).toBeGreaterThan(0);
    // 모든 후보가 주말 또는 공휴일.
    expect(dates.every((d) => d.isWeekend || d.isHoliday)).toBe(true);
  });

  it('범위 밖 연도 날짜는 holidayCoverage=outOfTable이며 주말만 후보에 든다(BR1.5)', () => {
    const outYear = HOLIDAY_TABLE_TO_YEAR + 1;
    const dates = listCandidateDates({ fromKstId: `${outYear}-01-01`, months: 3 });
    expect(dates.length).toBeGreaterThan(0);
    expect(dates.every((d) => d.holidayCoverage === 'outOfTable')).toBe(true);
    expect(dates.every((d) => d.isHoliday === false)).toBe(true);
    expect(dates.every((d) => d.isWeekend === true)).toBe(true);
  });

  it('months < 3 은 3으로 보정해 빈 목록이 되지 않게 한다(SD1)', () => {
    const corrected = listCandidateDates({ fromKstId: '2026-05-01', months: 1 });
    const baseline = listCandidateDates({ fromKstId: '2026-05-01', months: 3 });
    expect(corrected).toEqual(baseline);
  });

  it('유효하지 않은 fromKstId(실재하지 않는 날짜)는 빈 목록을 돌려준다(SD1, 예외 없이)', () => {
    expect(listCandidateDates({ fromKstId: '2026-02-30', months: 3 })).toEqual([]);
    expect(listCandidateDates({ fromKstId: 'nope', months: 3 })).toEqual([]);
    // 타입을 우회한 비정상 입력도 예외 없이 빈 목록.
    expect(listCandidateDates(null as unknown as DateRange)).toEqual([]);
  });
});

// --- 추천 recommend (BR2.1~BR2.6, SD1) --------------------------------------

describe('recommend (BR2.1~BR2.6)', () => {
  it('known: 조도·구름 모두 낮으면 recommended', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 10 }), knownCloud([10, 20, 15]));
    expect(r.verdict).toBe('recommended');
    expect(r.cloudConsidered).toBe(true);
    expect(r.reason).toBeNull();
  });

  it('known: 임계값 경계(조도=20, 구름=30)는 recommended 쪽이다(BR2.5)', () => {
    const r = recommend(
      astroWith({ moonIlluminationPct: MOON_ILLUMINATION_MAX_PCT }),
      knownCloud([CLOUD_MAX_PCT, CLOUD_MAX_PCT]),
    );
    expect(r.verdict).toBe('recommended');
  });

  it('known: 조도는 낮지만 밤 구름 평균이 30% 초과면 not_recommended(BR2.2)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 10 }), knownCloud([40, 50, 60]));
    expect(r.verdict).toBe('not_recommended');
    expect(r.cloudConsidered).toBe(true);
  });

  it('known: 조도가 20% 초과면 구름이 적어도 not_recommended(BR2.2)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 80 }), knownCloud([5, 10]));
    expect(r.verdict).toBe('not_recommended');
  });

  it('known: 밤 구간 구름 데이터가 전무하면 deferred(BR2.4·BR2.6)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 10 }), knownCloud([]));
    expect(r.verdict).toBe('deferred');
    expect(r.cloudConsidered).toBe(false);
  });

  it('known: 밤 구름 평균을 쓴다(경계 넘나드는 값의 평균으로 판정)', () => {
    // 평균 (10+50)/2 = 30 <= 30 → recommended.
    const r = recommend(astroWith({ moonIlluminationPct: 5 }), knownCloud([10, 50]));
    expect(r.verdict).toBe('recommended');
  });

  it('outOfHorizon: 구름 미적용하고 조도만으로 추천(BR2.3)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 15 }), outOfHorizonCloud());
    expect(r.verdict).toBe('recommended');
    expect(r.cloudConsidered).toBe(false);
  });

  it('outOfHorizon: 조도가 높으면 not_recommended(deferred 아님)(BR2.3)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 70 }), outOfHorizonCloud());
    expect(r.verdict).toBe('not_recommended');
    expect(r.cloudConsidered).toBe(false);
  });

  it('unknown: deferred로 보류하고 사유를 남긴다(BR2.4)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 10 }), unknownCloud());
    expect(r.verdict).toBe('deferred');
    expect(r.reason).toBe('cloud unknown');
    expect(r.cloudConsidered).toBe(false);
    expect(r.moonIlluminationPct).toBe(10); // 조도는 표시용으로 전달
  });

  it('우선순위 보존: 비정상(높은) 조도 + unknown이어도 deferred를 유지한다(SD1·BR2.4)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: 95 }), unknownCloud());
    expect(r.verdict).toBe('deferred'); // not_recommended로 조용히 뒤집히지 않음
  });

  it('조도를 [0,100]로 방어적으로 클램프한다(SD1)', () => {
    const over = recommend(astroWith({ moonIlluminationPct: 150 }), outOfHorizonCloud());
    expect(over.moonIlluminationPct).toBe(100);
    const under = recommend(astroWith({ moonIlluminationPct: -5 }), outOfHorizonCloud());
    expect(under.moonIlluminationPct).toBe(0);
    expect(under.verdict).toBe('recommended'); // 0 <= 20
  });

  it('조도가 숫자가 아니면(NaN) 보수적으로 밝음(100)으로 처리한다(SD1)', () => {
    const r = recommend(astroWith({ moonIlluminationPct: Number.NaN }), knownCloud([5, 10]));
    expect(r.moonIlluminationPct).toBe(100);
    expect(r.verdict).toBe('not_recommended'); // 100 > 20
  });

  it('known: 밤 창(fullDark)이 없으면 제공된 전체 시간 구름을 평균한다(BR2.6 보수적 전체)', () => {
    const astro = astroWith({
      moonIlluminationPct: 10,
      fullDarkStart: null,
      fullDarkEnd: null,
    });
    const r = recommend(astro, knownCloud([20, 20]));
    expect(r.verdict).toBe('recommended'); // 평균 20 <= 30
    expect(r.cloudConsidered).toBe(true);
  });

  it('known: 모든 시각이 밤 창 밖이면 전체 시각으로 폴백 평균한다(BR2.6)', () => {
    // 밤 창을 생성 시각 이전(17:00~17:30)으로 두어 모든 시간 샘플이 창 밖이 되게 한다.
    const astro = astroWith({
      moonIlluminationPct: 10,
      fullDarkStart: '2026-11-17T17:00:00+09:00',
      fullDarkEnd: '2026-11-17T17:30:00+09:00',
    });
    // knownCloud는 19:00,20:00,... 시각을 만든다 → 창(17:00~17:30) 밖.
    const r = recommend(astro, knownCloud([10, 10, 90]));
    // 폴백 전체 평균 (10+10+90)/3 ≈ 36.7 > 30 → not_recommended.
    expect(r.verdict).toBe('not_recommended');
    expect(r.cloudConsidered).toBe(true);
  });

  it('verdictSortKey는 recommended→not_recommended→deferred 순서를 준다(WF3)', () => {
    expect(verdictSortKey('recommended')).toBeLessThan(verdictSortKey('not_recommended'));
    expect(verdictSortKey('not_recommended')).toBeLessThan(verdictSortKey('deferred'));
  });

  it('C2 enum 밖 status는 예외 없이 보수적 deferred로 처리한다(SD1)', () => {
    const weird = {
      dateKstId: '2026-11-17',
      status: 'weird' as unknown as CloudForecast['status'],
      hourlyCloudPct: null,
      reason: null,
    } as CloudForecast;
    const r = recommend(astroWith({ moonIlluminationPct: 10 }), weird);
    expect(r.verdict).toBe('deferred');
    expect(r.reason).toBe('cloud status unknown');
  });
});
