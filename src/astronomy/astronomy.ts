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

import {
  Body,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchAltitude,
  SearchHourAngle,
  SearchRiseSet,
} from 'astronomy-engine';

import {
  AstronomyComputationError,
  type AstronomyInput,
  type AstronomyResult,
  type MoonHourlySample,
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

/** 달 체감 밝기 시간별 샘플 간격(분). 약 30분(§2.1). */
const MOON_HOURLY_STEP_MINUTES = 30;

/**
 * 대기 소광 계수(등급/대기질량, magnitude per airmass). 맑은 날 가정.
 * 가시광에서 통상 ≈ 0.2~0.3 mag/airmass이며 맑은 하늘 대표값 0.23을 쓴다.
 * 근거: 표준 맑은 대기 소광(V 밴드) 근사. 소광에 의한 투과율은
 * transmission = 10^(-0.4 · k · airmass)로 계산한다.
 */
const EXTINCTION_COEFF_MAG_PER_AIRMASS = 0.23;

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
 *
 * 결함 6 수정: 종전에는 월출과 월몰을 모두 range.startUtc에서 한 번만 전방
 * 탐색해, 월출이 범위 안이고 월몰이 월출보다 앞선 경우 "월출은 있는데
 * 월몰은 없음"이라는 비대칭 인공 결과가 생겼다. 이제 월출을 먼저 찾고,
 * 월몰은 그 월출 이후부터 탐색해(월출이 없으면 범위 시작부터) 같은 밤의
 * 월몰을 일관되게 찾는다. 둘 다 null 가능성은 그대로 유지한다.
 */
function computeMoonRiseSet(
  observer: Observer,
  range: NightRange,
): { moonriseUtc: Date | null; moonsetUtc: Date | null } {
  const inRange = (d: Date | null): Date | null => {
    if (d === null) {
      return null;
    }
    const ms = d.getTime();
    return ms >= range.startUtc.getTime() && ms <= range.endUtc.getTime() ? d : null;
  };

  const rise = SearchRiseSet(Body.Moon, observer, +1, range.startUtc, SEARCH_LIMIT_DAYS);
  // 월몰은 월출 이후 구간에서 탐색한다(월출이 있으면 그 시각부터, 없으면 범위
  // 시작부터). 전체 밤 범위를 덮도록 탐색 창을 유지해 비대칭 인공 결과를 없앤다.
  const setSearchFrom = rise ? rise.date : range.startUtc;
  const set = SearchRiseSet(Body.Moon, observer, -1, setSearchFrom, SEARCH_LIMIT_DAYS);

  return {
    moonriseUtc: inRange(rise ? rise.date : null),
    moonsetUtc: inRange(set ? set.date : null),
  };
}

/** 달 고도(도)를 주어진 UTC 시각·관측자에 대해 계산한다. */
function moonAltitudeDeg(observer: Observer, utc: Date): number {
  // 지형·굴절 보정 포함(normal): 체감 밝기용 겉보기 고도.
  const eq = Equator(Body.Moon, utc, observer, true, true);
  const hor = Horizon(utc, observer, eq.ra, eq.dec, 'normal');
  return hor.altitude;
}

/**
 * 고도(도)에 대한 상대 체감 밝기 가중치(정규화 전). 고도 ≤ 0이면 0.
 * 가중치 = sin(고도)[입사각] × 10^(-0.4·k·airmass)[대기 소광 투과율].
 * airmass는 Kasten-Young 근사로 저고도 발산을 막는다.
 */
function brightnessWeight(altitudeDeg: number): number {
  if (altitudeDeg <= 0) {
    return 0;
  }
  const altRad = (altitudeDeg * Math.PI) / 180;
  const sinAlt = Math.sin(altRad);
  // Kasten-Young(1989) airmass 근사. 저고도에서 1/sin 발산을 억제.
  const airmass = 1 / (sinAlt + 0.50572 * Math.pow(altitudeDeg + 6.07995, -1.6364));
  const transmission = Math.pow(10, -0.4 * EXTINCTION_COEFF_MAG_PER_AIRMASS * airmass);
  return sinAlt * transmission;
}

/**
 * 그날 밤 달의 실제 천문 남중 고도(도)를 구한다(§2.1 결정성 기준).
 *
 * 밤 범위 중앙에 가장 가까운 상위 자오선 통과(hour angle 0)를 찾아 그 고도를
 * 쓴다. 남중이 밤 범위 밖이어도 그 밤의 이론 남중 고도로 고정해, 월출만/
 * 월몰만 있는 밤에도 100% 스케일이 흔들리지 않게 한다.
 */
function moonTransitAltitudeDeg(observer: Observer, range: NightRange): number {
  const midMs = (range.startUtc.getTime() + range.endUtc.getTime()) / 2;
  // 범위 시작 하루 전부터 탐색해 밤을 지배하는 남중을 포함시킨다.
  const searchFrom = new Date(range.startUtc.getTime() - 24 * 60 * 60 * 1000);
  let cursor = searchFrom;
  let best: Date | null = null;
  // 최대 3회(약 3일) 자오선 통과를 순회하며 밤 중앙에 가장 가까운 것을 고른다.
  for (let i = 0; i < 3; i++) {
    const ev = SearchHourAngle(Body.Moon, observer, 0, cursor);
    const t = ev.time.date;
    if (best === null || Math.abs(t.getTime() - midMs) < Math.abs(best.getTime() - midMs)) {
      best = t;
    }
    // 다음 남중 탐색을 위해 커서를 이 통과 직후로 옮긴다.
    cursor = new Date(t.getTime() + 60 * 1000);
    if (t.getTime() > range.endUtc.getTime()) {
      break;
    }
  }
  const transitUtc = best ?? new Date(midMs);
  return moonAltitudeDeg(observer, transitUtc);
}

/**
 * 그날 밤 시간별 달 체감 밝기 곡선을 만든다(C1 확장, §2.1).
 *
 * 밤 범위를 약 30분 간격으로 균등 샘플링하고, 각 시각의 상대 체감 밝기를
 * "그날 밤 실제 천문 남중 고도 = 100%"로 정규화한 뒤, 그 날의 달 조도
 * (위상 밝기, moonIlluminationPct)를 곱해 **피크를 조도 크기에 맞춘다**:
 * 조도 67%인 날은 남중 시점의 곡선 최대가 67%가 된다(100% 아님). 고도에
 * 따른 대기 소광·입사각으로 곡선 모양(뜨고 지는 완만한 종형)은 유지하되,
 * 전체 높이는 달이 실제로 얼마나 밝은지(위상)에 비례한다. 고도 ≤ 0인
 * 시각은 0%. 반올림은 출력 경계에서만 한다(BR4.1).
 */
function computeMoonHourly(
  observer: Observer,
  range: NightRange,
  moonIlluminationPct: number,
): MoonHourlySample[] {
  const transitAltDeg = moonTransitAltitudeDeg(observer, range);
  const transitWeight = brightnessWeight(transitAltDeg);
  // 위상 스케일: 0~1. 피크를 이 비율로 낮춘다(조도 67% → 피크 67).
  const phaseScale = Math.max(0, Math.min(100, moonIlluminationPct)) / 100;

  const samples: MoonHourlySample[] = [];
  const stepMs = MOON_HOURLY_STEP_MINUTES * 60 * 1000;
  const startMs = range.startUtc.getTime();
  const endMs = range.endUtc.getTime();

  for (let ms = startMs; ms <= endMs; ms += stepMs) {
    const utc = new Date(ms);
    const altitudeDeg = moonAltitudeDeg(observer, utc);
    const weight = brightnessWeight(altitudeDeg);
    // transitWeight가 0(남중조차 지평 아래)인 비정상 밤은 전 구간 0으로 둔다.
    // 고도 정규화(남중=1) × 위상 조도(0~1) × 100 → 피크가 조도%에 맞춰진다.
    const relative = transitWeight > 0 ? (weight / transitWeight) * phaseScale * 100 : 0;
    const relativeBrightnessPct = Math.max(0, Math.min(100, Math.round(relative * 10) / 10));
    samples.push({
      hourKst: toKstIsoMinute(utc),
      altitudeDeg: Math.round(altitudeDeg * 10) / 10,
      relativeBrightnessPct,
    });
  }
  return samples;
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

    // 시간별 달 체감 밝기 곡선(C1 확장, §2.1). 피크를 그날 조도에 맞춘다.
    const moonHourly = computeMoonHourly(observer, range, moonIlluminationPct);

    return {
      dateKstId: input.dateKstId,
      moonIlluminationPct,
      moonHourly,
      civilTwilight: toTwilightWindow(civil),
      nauticalTwilight: toTwilightWindow(nautical),
      astronomicalTwilight: toTwilightWindow(astronomical),
      fullDarkStart,
      fullDarkEnd,
      moonrise: moonriseUtc ? toKstIsoMinute(moonriseUtc) : null,
      moonset: moonsetUtc ? toKstIsoMinute(moonsetUtc) : null,
      nightStart: toKstIsoMinute(range.startUtc),
      nightEnd: toKstIsoMinute(range.endUtc),
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
