/**
 * 내장 한국 공휴일 테이블 (BR1.5, SD3).
 *
 * 법정공휴일 + 대체공휴일을 코드 상수 테이블로 보관한다. 네트워크 호출
 * 없음(순수). 커버 연도 범위(HOLIDAY_TABLE_FROM_YEAR~TO_YEAR) 안의
 * 날짜만 공휴일 판정하며, 범위 밖 날짜는 holidayCoverage=outOfTable로
 * 두고 공휴일 정보 없이(주말만) 판정한다. 범위 밖 연도의 공휴일을
 * 임의로 추정하지 않는다.
 */

import { HOLIDAY_TABLE_FROM_YEAR, HOLIDAY_TABLE_TO_YEAR } from './constants.js';
import type { HolidayCoverage } from './types.js';

/** 공휴일 한 건(법정공휴일 또는 대체공휴일). */
export interface HolidayEntry {
  /** KST 날짜 키 YYYY-MM-DD. */
  dateKstId: string;
  /** 공휴일 이름(예: '추석', '대체공휴일'). */
  name: string;
}

/**
 * 내장 공휴일 테이블.
 *
 * 커버 범위: HOLIDAY_TABLE_FROM_YEAR ~ HOLIDAY_TABLE_TO_YEAR(포함).
 * 앱은 "현재 시점부터 3개월 이상 앞"의 연휴만 보여주므로(FR1.1), 과거
 * 연도는 수록하지 않고 현재 연도부터 앞으로만 담는다. 음력 기반 공휴일
 * (설날·추석·부처님오신날)은 연도별 양력 환산일을, 대체공휴일은 토·일
 * 겹침 규칙을 모든 공휴일에 일관되게 적용한 결과를 수록한다. 매년 갱신 대상.
 */
export const HOLIDAY_ENTRIES: readonly HolidayEntry[] = [
  // --- 2026 ---
  { dateKstId: '2026-01-01', name: '신정' },
  { dateKstId: '2026-02-16', name: '설날 연휴' },
  { dateKstId: '2026-02-17', name: '설날' },
  { dateKstId: '2026-02-18', name: '설날 연휴' },
  { dateKstId: '2026-03-01', name: '삼일절' },
  { dateKstId: '2026-03-02', name: '대체공휴일' },
  { dateKstId: '2026-05-05', name: '어린이날' },
  { dateKstId: '2026-05-24', name: '부처님오신날' },
  { dateKstId: '2026-05-25', name: '대체공휴일' },
  { dateKstId: '2026-06-06', name: '현충일' },
  { dateKstId: '2026-08-15', name: '광복절' },
  { dateKstId: '2026-08-17', name: '대체공휴일' },
  { dateKstId: '2026-09-24', name: '추석 연휴' },
  { dateKstId: '2026-09-25', name: '추석' },
  { dateKstId: '2026-09-26', name: '추석 연휴' },
  { dateKstId: '2026-09-28', name: '대체공휴일' },
  { dateKstId: '2026-10-03', name: '개천절' },
  { dateKstId: '2026-10-05', name: '대체공휴일' },
  { dateKstId: '2026-10-09', name: '한글날' },
  { dateKstId: '2026-12-25', name: '성탄절' },

  // --- 2027 ---
  { dateKstId: '2027-01-01', name: '신정' },
  { dateKstId: '2027-02-06', name: '설날 연휴' },
  { dateKstId: '2027-02-07', name: '설날' },
  { dateKstId: '2027-02-08', name: '설날 연휴' },
  { dateKstId: '2027-02-09', name: '대체공휴일' },
  { dateKstId: '2027-03-01', name: '삼일절' },
  { dateKstId: '2027-05-05', name: '어린이날' },
  { dateKstId: '2027-05-13', name: '부처님오신날' },
  { dateKstId: '2027-06-06', name: '현충일' },
  { dateKstId: '2027-06-07', name: '대체공휴일' },
  { dateKstId: '2027-08-15', name: '광복절' },
  { dateKstId: '2027-08-16', name: '대체공휴일' },
  { dateKstId: '2027-09-14', name: '추석 연휴' },
  { dateKstId: '2027-09-15', name: '추석' },
  { dateKstId: '2027-09-16', name: '추석 연휴' },
  { dateKstId: '2027-10-03', name: '개천절' },
  { dateKstId: '2027-10-04', name: '대체공휴일' },
  { dateKstId: '2027-10-09', name: '한글날' },
  { dateKstId: '2027-10-11', name: '대체공휴일' },
  { dateKstId: '2027-12-25', name: '성탄절' },

  // --- 2028 ---
  { dateKstId: '2028-01-01', name: '신정' },
  { dateKstId: '2028-01-26', name: '설날 연휴' },
  { dateKstId: '2028-01-27', name: '설날' },
  { dateKstId: '2028-01-28', name: '설날 연휴' },
  { dateKstId: '2028-03-01', name: '삼일절' },
  { dateKstId: '2028-05-02', name: '부처님오신날' },
  { dateKstId: '2028-05-05', name: '어린이날' },
  { dateKstId: '2028-06-06', name: '현충일' },
  { dateKstId: '2028-08-15', name: '광복절' },
  { dateKstId: '2028-10-03', name: '추석 연휴' },
  { dateKstId: '2028-10-04', name: '추석' },
  { dateKstId: '2028-10-05', name: '추석 연휴' },
  { dateKstId: '2028-10-09', name: '한글날' },
  { dateKstId: '2028-12-25', name: '성탄절' },
];

/** 빠른 조회를 위한 dateKstId → 공휴일 이름 맵. 중복 날짜는 첫 이름 유지. */
const HOLIDAY_BY_DATE: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const entry of HOLIDAY_ENTRIES) {
    if (!map.has(entry.dateKstId)) {
      map.set(entry.dateKstId, entry.name);
    }
  }
  return map;
})();

/** 연도가 테이블 커버 범위(포함) 안인지 판정한다(BR1.5). */
export function isYearCovered(year: number): boolean {
  return year >= HOLIDAY_TABLE_FROM_YEAR && year <= HOLIDAY_TABLE_TO_YEAR;
}

/**
 * 날짜의 공휴일 테이블 커버 여부를 돌려준다(BR1.5).
 * dateKstId의 연도를 테이블 범위와 비교한다.
 */
export function holidayCoverageFor(dateKstId: string): HolidayCoverage {
  const year = Number(dateKstId.slice(0, 4));
  return isYearCovered(year) ? 'covered' : 'outOfTable';
}

/**
 * 날짜가 공휴일인지 판정한다(BR1.5).
 *
 * 커버 범위 밖 연도는 항상 false(outOfTable: 공휴일 정보 없음, 주말만).
 * 범위 안이면 내장 테이블(대체공휴일 포함)을 조회한다.
 */
export function isHoliday(dateKstId: string): boolean {
  if (holidayCoverageFor(dateKstId) === 'outOfTable') {
    return false;
  }
  return HOLIDAY_BY_DATE.has(dateKstId);
}

/**
 * 날짜의 공휴일 이름을 돌려준다. 공휴일이 아니거나 범위 밖이면 null.
 * 연휴 묶음 라벨(공휴일명 우선)에 쓰인다(BR1.4).
 */
export function holidayName(dateKstId: string): string | null {
  if (holidayCoverageFor(dateKstId) === 'outOfTable') {
    return null;
  }
  return HOLIDAY_BY_DATE.get(dateKstId) ?? null;
}
