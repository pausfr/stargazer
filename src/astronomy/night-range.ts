/**
 * "그날 밤" 범위 산출 (BR3.1, BR3.2).
 *
 * 월출/월몰이 "그날 밤" 안에 있을 때만 시각을 반환하기 위한 판정 범위다.
 * nightStart/End가 입력되면 그 범위를, 없으면 기본 범위(해당 KST 날짜
 * 18:00 ~ 다음날 06:00)를 결정론적으로 적용한다("미정" 아님).
 */

import { parseKstToUtcDate } from './validation.js';
import type { AstronomyInput } from './types.js';

/** 해석된 "그날 밤" 범위. 내부 계산용 UTC 경계 쌍. */
export interface NightRange {
  /** 범위 시작(UTC). */
  startUtc: Date;
  /** 범위 끝(UTC). */
  endUtc: Date;
}

/**
 * KST 날짜 키와 시/분을 받아 그 시각의 UTC Date를 만든다.
 * dayOffset으로 다음날 등을 표현한다(예: 익일 06:00 = dayOffset 1).
 */
function kstWallClockToUtc(dateKstId: string, hour: number, dayOffset: number): Date {
  const [yearStr, monthStr, dayStr] = dateKstId.split('-');
  // KST 벽시계 시각을 UTC로: KST = UTC + 9h 이므로 UTC = KST - 9h.
  const utcMs = Date.UTC(
    Number(yearStr),
    Number(monthStr) - 1,
    Number(dayStr) + dayOffset,
    hour - 9,
    0,
    0,
    0,
  );
  return new Date(utcMs);
}

/**
 * 입력의 "그날 밤" 범위를 UTC 경계 쌍으로 해석한다.
 * nightStart/End가 모두 있으면 그 값을, 없으면 기본 범위(BR3.2)를 쓴다.
 *
 * 전제: 검증(validateInput)이 이미 통과해 반쪽 경계·역전은 없다.
 */
export function resolveNightRange(input: AstronomyInput): NightRange {
  const hasStart = input.nightStartKst !== undefined && input.nightStartKst !== null;
  const hasEnd = input.nightEndKst !== undefined && input.nightEndKst !== null;

  if (hasStart && hasEnd) {
    const startUtc = parseKstToUtcDate(input.nightStartKst as string);
    const endUtc = parseKstToUtcDate(input.nightEndKst as string);
    if (startUtc === null || endUtc === null) {
      // 검증을 통과했다면 도달하지 않는 방어 분기.
      throw new Error('resolveNightRange called with unvalidated night boundary');
    }
    return { startUtc, endUtc };
  }

  // 기본 범위(BR3.2): 해당 KST 날짜 18:00 ~ 다음날 06:00.
  return {
    startUtc: kstWallClockToUtc(input.dateKstId, 18, 0),
    endUtc: kstWallClockToUtc(input.dateKstId, 6, 1),
  };
}
