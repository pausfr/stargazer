/**
 * "그날 밤" 범위 산출 (BR3.1, BR3.2).
 *
 * "밤"의 경계는 태양 기준이다: 그날 저녁 일몰(태양 고도 0도 하강 교차)부터
 * 다음날 새벽 일출(태양 고도 0도 상승 교차)까지를 실제 밤 범위로 쓴다.
 * 월출/월몰이 "그날 밤" 안에 있을 때만 시각을 반환하기 위한 판정 범위이자,
 * 상세 차트의 x축 범위이기도 하다.
 *
 * 재작업(디자인/로직 전면 보완): 종전에는 고정 18:00~다음날 06:00을 그대로
 * 밤 범위로 썼다. 달이 늦게 뜨는 시기(예: 월출이 자정 전후)에는 이 고정
 * 창이 "그날 밤"의 상당 부분(저녁 일몰~18:00 이전, 06:00~일출 이후)을
 * 잘라내, 달 밝기 곡선이 남중을 못 담고 반쪽(단조 증가/감소)으로 보이거나
 * 실제로는 성립하는 월몰이 범위 밖으로 밀려 null이 되는 결함이 있었다.
 * 이제 일몰/일출을 직접 탐색해 밤 전체를 담는다. nightStartKst/nightEndKst
 * 입력은 "이 대략적 범위가 속한 밤"을 가리키는 힌트로만 쓰고(그 범위의
 * 시작 시각을 탐색 기준일로 삼음), 실제 경계는 태양 고도로 재계산한다.
 */

import { Body, Observer, SearchAltitude } from 'astronomy-engine';
import { parseKstToUtcDate } from './validation.js';
import type { AstronomyInput } from './types.js';

/** 해석된 "그날 밤" 범위. 내부 계산용 UTC 경계 쌍. */
export interface NightRange {
  /** 범위 시작(UTC) — 그날 저녁 일몰. */
  startUtc: Date;
  /** 범위 끝(UTC) — 다음날 새벽 일출. */
  endUtc: Date;
}

/** 일몰/일출 탐색 창(일). "그날 밤"을 넉넉히 덮는다. */
const SEARCH_LIMIT_DAYS = 1.5;

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
 * 관측자 기준 그날의 실제 일몰~다음 일출을 태양 고도 0도 교차로 탐색한다.
 * searchFromUtc 이전 가까운 시각(정오 KST 근방)부터 찾아, 그날 저녁의
 * 일몰과 그 다음 새벽의 일출을 잡는다. 극지 백야 등으로 교차가 성립하지
 * 않으면(탐색 실패) 고정 18:00~다음날 06:00로 안전하게 폴백한다.
 */
function searchSunsetSunrise(
  observer: Observer,
  dateKstId: string,
): { startUtc: Date; endUtc: Date } {
  // 정오 KST부터 탐색을 시작해 그날 저녁 일몰을 안정적으로 잡는다.
  const noonUtc = kstWallClockToUtc(dateKstId, 12, 0);
  const sunset = SearchAltitude(Body.Sun, observer, -1, noonUtc, SEARCH_LIMIT_DAYS, 0);
  const sunsetUtc = sunset ? sunset.date : null;

  const sunriseSearchFrom = sunsetUtc ?? noonUtc;
  const sunrise = SearchAltitude(Body.Sun, observer, +1, sunriseSearchFrom, SEARCH_LIMIT_DAYS, 0);
  const sunriseUtc = sunrise ? sunrise.date : null;

  if (sunsetUtc === null || sunriseUtc === null || sunsetUtc.getTime() >= sunriseUtc.getTime()) {
    // 백야·극야 등 교차 미성립 — 고정 범위로 안전 폴백(결정적 결과 보장).
    return {
      startUtc: kstWallClockToUtc(dateKstId, 18, 0),
      endUtc: kstWallClockToUtc(dateKstId, 6, 1),
    };
  }
  return { startUtc: sunsetUtc, endUtc: sunriseUtc };
}

/**
 * 입력의 "그날 밤" 범위를 UTC 경계 쌍으로 해석한다(일몰~일출 기준).
 *
 * nightStartKst/nightEndKst가 주어지면 그 시작 시각이 속한 KST 날짜를
 * 탐색 기준일로 쓰고, 그 날의 실제 일몰~다음 일출을 재계산해 돌려준다
 * (입력 경계를 그대로 쓰지 않음 — 고정 범위의 한계를 없애기 위함).
 * 없으면 dateKstId 기준으로 동일하게 계산한다.
 *
 * 전제: 검증(validateInput)이 이미 통과해 반쪽 경계·역전은 없다.
 */
export function resolveNightRange(input: AstronomyInput): NightRange {
  const observer = new Observer(input.lat, input.lon, 0);

  const hasStart = input.nightStartKst !== undefined && input.nightStartKst !== null;
  const hasEnd = input.nightEndKst !== undefined && input.nightEndKst !== null;

  if (hasStart && hasEnd) {
    const startUtc = parseKstToUtcDate(input.nightStartKst as string);
    const endUtc = parseKstToUtcDate(input.nightEndKst as string);
    if (startUtc === null || endUtc === null) {
      // 검증을 통과했다면 도달하지 않는 방어 분기.
      throw new Error('resolveNightRange called with unvalidated night boundary');
    }
    // 입력 경계가 가리키는 KST 날짜를 기준일로 재해석(힌트로만 사용).
    const kstMs = startUtc.getTime() + 9 * 60 * 60 * 1000;
    const kst = new Date(kstMs);
    const hintDateKstId = `${kst.getUTCFullYear().toString().padStart(4, '0')}-${(kst.getUTCMonth() + 1).toString().padStart(2, '0')}-${kst.getUTCDate().toString().padStart(2, '0')}`;
    return searchSunsetSunrise(observer, hintDateKstId);
  }

  return searchSunsetSunrise(observer, input.dateKstId);
}
