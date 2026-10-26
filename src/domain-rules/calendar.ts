/**
 * 달력 — 후보 밤 산출 (WF1, BR1.1~BR1.5, SD1·SD2).
 *
 * listCandidateDates(range)가 유일한 공개 진입점이다(C3). 범위 전개 →
 * 주말/공휴일 분류 → 후보 선별 → 밤 범위 부여 → 연휴 묶음의 순서로
 * 순수하게 동작한다. 네트워크·전역 가변 상태·예외 없음(C3는 throws를
 * 선언하지 않는 동기 함수): 입력 검증 실패는 안전한 기본값(빈 목록 또는
 * months 보정)으로 처리한다(SD1).
 */

import { holidayCoverageFor, isHoliday, holidayName } from './holidays.js';
import type { CalendarDate, DateRange, HolidayCoverage } from './types.js';

/** KST 고정 오프셋(UTC+9). 한국은 서머타임이 없다. U1·U2와 동일 관례. */
const DATE_ID_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 후보 밤 생성 기본 범위(BR1.3): KST 저녁 18:00 ~ 다음날 새벽 06:00. */
const NIGHT_START_HOUR = 18;
const NIGHT_END_HOUR = 6;

/** months 하한(BR1.1). 미만 입력은 이 값으로 보정한다(SD1). */
const MIN_MONTHS = 3;

/** 날짜 키를 UTC epoch-day 인덱스로 환산(요일·순회용, 벽시계 날짜 기준). */
function epochDay(year: number, monthIndex: number, day: number): number {
  return Math.floor(Date.UTC(year, monthIndex, day) / (24 * 60 * 60 * 1000));
}

/** YYYY-MM-DD 포맷(2자리 0 패딩). */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toDateKstId(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** 실재 달력 날짜 + 형식 검증(2026-02-30 같은 롤오버 거부). */
function isRealCalendarDate(dateKstId: string): boolean {
  if (!DATE_ID_RE.test(dateKstId)) {
    return false;
  }
  const [y, m, d] = dateKstId.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return false;
  }
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** UTC getUTCDay(): 0=일, 6=토. 토·일을 주말로 본다. */
function isWeekendDay(year: number, monthIndex: number, day: number): boolean {
  const dow = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  return dow === 0 || dow === 6;
}

/** 밤 시작(KST 저녁) ISO 문자열(+09:00). */
function nightStartIso(year: number, monthIndex: number, day: number): string {
  return `${toDateKstId(year, monthIndex, day)}T${pad2(NIGHT_START_HOUR)}:00:00+09:00`;
}

/** 밤 끝(다음날 KST 새벽) ISO 문자열(+09:00). epoch-day 기준 하루 뒤. */
function nightEndIso(year: number, monthIndex: number, day: number): string {
  const next = new Date(Date.UTC(year, monthIndex, day + 1));
  return `${toDateKstId(
    next.getUTCFullYear(),
    next.getUTCMonth(),
    next.getUTCDate(),
  )}T${pad2(NIGHT_END_HOUR)}:00:00+09:00`;
}

/** 범위 전개로 만드는 하루치 원시 날짜 정보(후보 선별 전). */
interface DayCell {
  dateKstId: string;
  year: number;
  monthIndex: number;
  day: number;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayCoverage: HolidayCoverage;
  epochDay: number;
}

/**
 * fromKstId부터 months개월 범위의 모든 날짜를 전개한다.
 * 끝 경계: 시작일과 같은 일(day)의 months개월 뒤(배타)까지.
 */
function expandRange(fromKstId: string, months: number): DayCell[] {
  const [fy, fm, fd] = fromKstId.split('-').map(Number);
  const startIndex = epochDay(fy, fm - 1, fd);
  // months개월 뒤의 같은 일을 배타 상한으로 둔다.
  const endExclusiveIndex = epochDay(fy, fm - 1 + months, fd);

  const cells: DayCell[] = [];
  for (let idx = startIndex; idx < endExclusiveIndex; idx++) {
    const date = new Date(idx * 24 * 60 * 60 * 1000);
    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth();
    const day = date.getUTCDate();
    const dateKstId = toDateKstId(year, monthIndex, day);
    cells.push({
      dateKstId,
      year,
      monthIndex,
      day,
      isWeekend: isWeekendDay(year, monthIndex, day),
      isHoliday: isHoliday(dateKstId),
      holidayCoverage: holidayCoverageFor(dateKstId),
      epochDay: idx,
    });
  }
  return cells;
}

/**
 * WF1: fromKstId부터 months(>=3)개월 범위의 모든 주말·공휴일 연휴 밤을
 * 날짜순으로 산출한다(C3).
 *
 * 입력 검증(SD1, 예외 없이):
 * - fromKstId가 실재 YYYY-MM-DD가 아니면 빈 목록을 돌려준다.
 * - months < 3 이면 3으로 보정한다(빈 목록이 되지 않도록, BR1.1·SD1).
 *
 * 선별·그룹핑(BR1.1~BR1.5):
 * - isWeekend OR isHoliday 인 날짜만 후보 밤으로 채택(공휴일 없으면 주말만, BR1.2).
 * - 각 후보에 nightStartKst(저녁)·nightEndKst(다음날 새벽)를 KST로 부여(BR1.3).
 * - 연속된(끊김 없는) 후보에 동일 holidayGroupId와 묶음 라벨을 부여(BR1.4,
 *   공휴일명 우선, 없으면 '주말').
 *
 * @param range 조회 범위(시작일·개월 수).
 * @returns 날짜순 CalendarDate[]. 유효하지 않은 시작일이면 빈 배열.
 */
export function listCandidateDates(range: DateRange): CalendarDate[] {
  // SD1: 진입점 검증 게이트(fail-safe, 예외 없이).
  if (range === null || typeof range !== 'object') {
    return [];
  }
  if (typeof range.fromKstId !== 'string' || !isRealCalendarDate(range.fromKstId)) {
    return [];
  }
  const months =
    typeof range.months === 'number' && range.months >= MIN_MONTHS
      ? Math.floor(range.months)
      : MIN_MONTHS;

  const cells = expandRange(range.fromKstId, months);

  // 후보 선별: 주말 또는 공휴일(BR1.1·BR1.2).
  const candidates = cells.filter((c) => c.isWeekend || c.isHoliday);
  if (candidates.length === 0) {
    return [];
  }

  // 연휴 묶음(BR1.4): 끊김 없이 이어진 후보에 동일 groupId를 부여한다.
  const result: CalendarDate[] = [];
  let g = 0;
  const groupIdOf: string[] = new Array(candidates.length);
  for (let i = 0; i < candidates.length; i++) {
    if (i === 0 || candidates[i].epochDay !== candidates[i - 1].epochDay + 1) {
      g += 1;
    }
    groupIdOf[i] = `group-${g}`;
  }

  // 그룹별 라벨 결정: 그룹 내 첫 공휴일명, 없으면 '주말'.
  const labelByGroup = new Map<string, string>();
  for (let i = 0; i < candidates.length; i++) {
    const gid = groupIdOf[i];
    if (!labelByGroup.has(gid)) {
      labelByGroup.set(gid, '주말');
    }
    const name = holidayName(candidates[i].dateKstId);
    if (name !== null && labelByGroup.get(gid) === '주말') {
      labelByGroup.set(gid, name);
    }
  }

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    result.push({
      dateKstId: c.dateKstId,
      label: labelByGroup.get(groupIdOf[i]) ?? '주말',
      isHoliday: c.isHoliday,
      isWeekend: c.isWeekend,
      holidayCoverage: c.holidayCoverage,
      nightStartKst: nightStartIso(c.year, c.monthIndex, c.day),
      nightEndKst: nightEndIso(c.year, c.monthIndex, c.day),
      holidayGroupId: groupIdOf[i],
    });
  }

  return result;
}
