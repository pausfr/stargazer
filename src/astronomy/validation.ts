/**
 * 입력 검증 게이트 (SD1, BR5.1).
 *
 * computeAstronomy 진입점에서 단일 게이트로 동작한다. 검증 통과 전에는
 * 계산 로직에 진입하지 않는다(fail-fast). 유효하지 않은 입력은 조용히
 * 실패하지 않고 AstronomyComputationError로 전달한다.
 */

import { AstronomyComputationError, type AstronomyInput } from './types.js';

/** KST 고정 오프셋(UTC+9). 한국은 서머타임이 없다. */
const KST_OFFSET_SUFFIX = '+09:00';

const DATE_ID_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * dateKstId가 형식(YYYY-MM-DD)과 실재 달력 날짜를 모두 만족하는지 검사한다.
 * 예: 2026-02-30 은 형식은 맞지만 실재하지 않으므로 거부한다.
 */
function isRealCalendarDate(dateKstId: string): boolean {
  if (!DATE_ID_RE.test(dateKstId)) {
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

/**
 * KST ISO 시각 문자열을 UTC Date로 파싱한다.
 * 오프셋이 명시되지 않은 문자열은 KST(+09:00)로 해석한다.
 * 파싱 불가하면 null.
 */
export function parseKstToUtcDate(kstIso: string): Date | null {
  if (typeof kstIso !== 'string' || kstIso.trim() === '') {
    return null;
  }
  const hasOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(kstIso);
  const normalized = hasOffset ? kstIso : `${kstIso}${KST_OFFSET_SUFFIX}`;
  const ms = Date.parse(normalized);
  if (Number.isNaN(ms)) {
    return null;
  }
  return new Date(ms);
}

/**
 * AstronomyInput을 검증한다. 유효하지 않으면 AstronomyComputationError를 던진다.
 *
 * 검증 항목(SD1):
 * - dateKstId: 형식 YYYY-MM-DD + 실재 달력 날짜
 * - lat: 숫자, [-90, 90]
 * - lon: 숫자, [-180, 180]
 * - night 경계: 둘 다 있거나 둘 다 없음(반쪽은 오류, BR3.2),
 *   둘 다 있으면 각각 유효한 KST ISO 시각이고 start < end
 */
export function validateInput(input: AstronomyInput): void {
  if (input === null || typeof input !== 'object') {
    throw new AstronomyComputationError('input must be an object');
  }

  if (!isRealCalendarDate(input.dateKstId)) {
    throw new AstronomyComputationError(
      `invalid dateKstId: ${String(input.dateKstId)} (expected real YYYY-MM-DD)`,
    );
  }

  if (
    typeof input.lat !== 'number' ||
    Number.isNaN(input.lat) ||
    input.lat < -90 ||
    input.lat > 90
  ) {
    throw new AstronomyComputationError(`invalid lat: ${String(input.lat)} (expected [-90, 90])`);
  }

  if (
    typeof input.lon !== 'number' ||
    Number.isNaN(input.lon) ||
    input.lon < -180 ||
    input.lon > 180
  ) {
    throw new AstronomyComputationError(`invalid lon: ${String(input.lon)} (expected [-180, 180])`);
  }

  const hasStart = input.nightStartKst !== undefined && input.nightStartKst !== null;
  const hasEnd = input.nightEndKst !== undefined && input.nightEndKst !== null;

  // 반쪽 경계는 유효하지 않은 입력(BR3.2 -> BR5.1).
  if (hasStart !== hasEnd) {
    throw new AstronomyComputationError(
      'night boundary must provide both nightStartKst and nightEndKst, or neither',
    );
  }

  if (hasStart && hasEnd) {
    const start = parseKstToUtcDate(input.nightStartKst as string);
    const end = parseKstToUtcDate(input.nightEndKst as string);
    if (start === null || end === null) {
      throw new AstronomyComputationError('night boundary must be valid KST ISO datetimes');
    }
    if (start.getTime() >= end.getTime()) {
      throw new AstronomyComputationError('nightStartKst must be earlier than nightEndKst');
    }
  }
}
