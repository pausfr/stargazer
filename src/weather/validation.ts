/**
 * 진입점 입력 검증 게이트 (SD1, BR2.1, NFR6.2).
 *
 * getCloudForecast 진입점에서 단일 게이트로 동작한다. C2 계약의
 * `throws: never` 와 정합하게 예외를 던지지 않고 불리언을 반환한다.
 * 검증 실패 시 상위 오케스트레이션이 외부 호출 없이
 * unknown(reason="invalid input")으로 정규화한다(SD1). 조용히 실패하지 않는다.
 */

import type { CloudForecastQuery } from './types.js';

const DATE_ID_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * dateKstId가 형식(YYYY-MM-DD)과 실재 달력 날짜를 모두 만족하는지 검사한다.
 * 예: 2026-02-30 은 형식은 맞지만 실재하지 않으므로 거부한다.
 */
function isRealCalendarDate(dateKstId: unknown): boolean {
  if (typeof dateKstId !== 'string' || !DATE_ID_RE.test(dateKstId)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateKstId.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  // UTC 기준으로 재구성해 롤오버가 없는지 확인(실재 날짜 검증).
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

/** 좌표 한 축이 숫자이고 주어진 범위 안인지 검사한다. */
function isNumberInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max;
}

/**
 * CloudForecastQuery를 검증한다(fail-fast 게이트, SD1).
 *
 * 검증 항목:
 * - dateKstId: 형식 YYYY-MM-DD + 실재 달력 날짜
 * - lat: 숫자, [-90, 90]
 * - lon: 숫자, [-180, 180]
 *
 * @returns 유효하면 true, 아니면 false(예외를 던지지 않는다).
 */
export function isValidQuery(query: CloudForecastQuery): boolean {
  if (query === null || typeof query !== 'object') {
    return false;
  }
  return (
    isRealCalendarDate(query.dateKstId) &&
    isNumberInRange(query.lat, -90, 90) &&
    isNumberInRange(query.lon, -180, 180)
  );
}
