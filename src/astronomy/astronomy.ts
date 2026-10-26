/**
 * 천문 계산 핵심 모듈 (C1 computeAstronomy).
 *
 * 달 조도(BR1.1)·박명 3종(BR2.1)·완전한 밤(BR2.2)·월출/월몰(BR3.1)을
 * 계산한다. 내부 계산은 UTC로 하고, 출력 경계에서만 KST ISO 문자열로
 * 변환하며(BR4.2) 조도·시각을 반올림한다(BR4.1).
 *
 * 천문 라이브러리는 astronomy-engine(순수 JS/TS, 무의존·무키, MIT)을 쓴다.
 * 내부 계산 함수와 라이브러리 접근은 이 모듈에 캡슐화하며, 외부에는
 * computeAstronomy만 노출한다(index.ts).
 */

import { Body, Illumination, Observer, SearchAltitude, SearchRiseSet } from 'astronomy-engine';

import {
  AstronomyComputationError,
  type AstronomyInput,
  type AstronomyResult,
  type TwilightWindow,
} from './types.js';
import { validateInput } from './validation.js';
import { resolveNightRange, type NightRange } from './night-range.js';

/** 박명 종류별 태양 고도(도). */
const CIVIL_ALTITUDE_DEG = -6;
const NAUTICAL_ALTITUDE_DEG = -12;
const ASTRONOMICAL_ALTITUDE_DEG = -18;

/** 박명·월출몰 탐색 창(일). "그날 밤"을 넉넉히 덮는다. */
const SEARCH_LIMIT_DAYS = 1.5;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * UTC Date를 KST ISO 문자열(분 단위)로 변환한다(BR4.1, BR4.2).
 * 예: 2026-10-20T18:13+09:00.
 */
function toKstIsoMinute(utc: Date): string {
  const kst = new Date(utc.getTime() + KST_OFFSET_MS);
  const yyyy = kst.getUTCFullYear().toString().padStart(4, '0');
  const mm = (kst.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = kst.getUTCDate().toString().padStart(2, '0');
  const hh = kst.getUTCHours().toString().padStart(2, '0');
  const min = kst.getUTCMinutes().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}+09:00`;
}

/** 저녁(하강) 태양 고도 교차 시각. 범위 내 미성립이면 null. */
function searchDuskUtc(observer: Observer, startUtc: Date, altitudeDeg: number): Date | null {
  const t = SearchAltitude(Body.Sun, observer, -1, startUtc, SEARCH_LIMIT_DAYS, altitudeDeg);
  return t ? t.date : null;
}

/** 새벽(상승) 태양 고도 교차 시각. 범위 내 미성립이면 null. */
function searchDawnUtc(observer: Observer, startUtc: Date, altitudeDeg: number): Date | null {
  const t = SearchAltitude(Body.Sun, observer, +1, startUtc, SEARCH_LIMIT_DAYS, altitudeDeg);
  return t ? t.date : null;
}

/**
 * 한 박명 종류의 저녁(start)·새벽(end) 경계를 구한다(BR2.1).
 * 각 경계는 독립적으로 null 가능.
 */
function computeTwilightWindow(
  observer: Observer,
  nightStartUtc: Date,
  altitudeDeg: number,
): { startUtc: Date | null; endUtc: Date | null } {
  const duskUtc = searchDuskUtc(observer, nightStartUtc, altitudeDeg);
  // 새벽 경계는 저녁 경계(또는 범위 시작) 이후부터 찾는다.
  const dawnSearchFrom = duskUtc ?? nightStartUtc;
  const dawnUtc = searchDawnUtc(observer, dawnSearchFrom, altitudeDeg);
  return { startUtc: duskUtc, endUtc: dawnUtc };
}

function toTwilightWindow(win: { startUtc: Date | null; endUtc: Date | null }): TwilightWindow {
  return {
    start: win.startUtc ? toKstIsoMinute(win.startUtc) : null,
    end: win.endUtc ? toKstIsoMinute(win.endUtc) : null,
  };
}

/**
 * "그날 밤" 범위 안의 월출·월몰을 구한다(BR3.1). 서로 독립적으로 null 가능.
 */
function computeMoonRiseSet(
  observer: Observer,
  range: NightRange,
): { moonriseUtc: Date | null; moonsetUtc: Date | null } {
  const rise = SearchRiseSet(Body.Moon, observer, +1, range.startUtc, SEARCH_LIMIT_DAYS);
  const set = SearchRiseSet(Body.Moon, observer, -1, range.startUtc, SEARCH_LIMIT_DAYS);

  const inRange = (d: Date | null): Date | null => {
    if (d === null) {
      return null;
    }
    const ms = d.getTime();
    return ms >= range.startUtc.getTime() && ms <= range.endUtc.getTime() ? d : null;
  };

  return {
    moonriseUtc: inRange(rise ? rise.date : null),
    moonsetUtc: inRange(set ? set.date : null),
  };
}

/** 조도(0~1)를 0~100% 소수 1자리로 반올림한다(BR4.1). */
function roundIlluminationPct(fraction: number): number {
  return Math.round(fraction * 100 * 10) / 10;
}

/**
 * 한 날짜·좌표의 천문 계산을 수행한다(C1의 유일한 public 진입점).
 *
 * 유효하지 않은 입력이나 계산 불가 시 AstronomyComputationError를 던진다
 * (BR5.1 — 조용한 실패 금지). 호출부(U4)가 에러·재시도 UI를 처리한다.
 *
 * @param input 계산 입력(KST 날짜·좌표, 선택적 "그날 밤" 경계)
 * @returns 달 조도·박명·완전한 밤·월출/월몰이 담긴 AstronomyResult
 * @throws {AstronomyComputationError} 입력이 유효하지 않거나 계산에 실패한 경우
 */
export function computeAstronomy(input: AstronomyInput): AstronomyResult {
  // SD1: 단일 검증 게이트. 통과 전에는 계산에 진입하지 않는다.
  validateInput(input);

  try {
    const observer = new Observer(input.lat, input.lon, 0);
    const range = resolveNightRange(input);

    // 달 조도: 월출/월몰 유무와 무관하게 항상 실제값(BR1.1).
    // "그날 밤"의 대표 시점(범위 시작)에서 계산한다.
    const illum = Illumination(Body.Moon, range.startUtc);
    const moonIlluminationPct = roundIlluminationPct(illum.phase_fraction);

    // 박명 3종(BR2.1).
    const civil = computeTwilightWindow(observer, range.startUtc, CIVIL_ALTITUDE_DEG);
    const nautical = computeTwilightWindow(observer, range.startUtc, NAUTICAL_ALTITUDE_DEG);
    const astronomical = computeTwilightWindow(observer, range.startUtc, ASTRONOMICAL_ALTITUDE_DEG);

    // 완전한 밤(BR2.2): 저녁 천문박명 종료 ~ 새벽 천문박명 시작.
    // 둘 다 성립하고 전자가 후자보다 앞설 때만 값, 아니면 null 쌍.
    let fullDarkStart: string | null = null;
    let fullDarkEnd: string | null = null;
    if (
      astronomical.startUtc !== null &&
      astronomical.endUtc !== null &&
      astronomical.startUtc.getTime() < astronomical.endUtc.getTime()
    ) {
      fullDarkStart = toKstIsoMinute(astronomical.startUtc);
      fullDarkEnd = toKstIsoMinute(astronomical.endUtc);
    }

    // 월출/월몰(BR3.1): "그날 밤" 범위 안일 때만.
    const { moonriseUtc, moonsetUtc } = computeMoonRiseSet(observer, range);

    return {
      dateKstId: input.dateKstId,
      moonIlluminationPct,
      civilTwilight: toTwilightWindow(civil),
      nauticalTwilight: toTwilightWindow(nautical),
      astronomicalTwilight: toTwilightWindow(astronomical),
      fullDarkStart,
      fullDarkEnd,
      moonrise: moonriseUtc ? toKstIsoMinute(moonriseUtc) : null,
      moonset: moonsetUtc ? toKstIsoMinute(moonsetUtc) : null,
    };
  } catch (err) {
    // 검증 외 계산 단계의 실패도 조용히 삼키지 않고 오류로 전달한다(BR5.1).
    if (err instanceof AstronomyComputationError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new AstronomyComputationError(`astronomy computation failed: ${message}`);
  }
}
