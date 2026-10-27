/**
 * u1-astronomy 단위 테스트 (test-after).
 *
 * 알려진 기준 날짜의 결정론적 실제값으로 검증한다. 천문 라이브러리는
 * 모킹하지 않고, 기대값은 라이브러리 자체 출력과 교차 확인한다.
 *
 * 좌표: 서울 대표 좌표(위도 37.5665, 경도 126.978).
 * 기준 날짜(astronomy-engine 교차 확인):
 *  - 신월 ≈ 2026-11-09 (KST 18:00 조도 ≈ 0.2%)
 *  - 보름 ≈ 2026-11-24 (조도 ≈ 99.7%)
 *  - 중간 위상 ≈ 2026-11-17 (조도 ≈ 49%)
 *  - 고위도 백야(Tromsø 2026-06-21): 천문박명 미성립 → 완전한 밤 null 쌍
 */

import { describe, expect, it } from 'vitest';
import { Body, Illumination, Observer, SearchAltitude, SearchRiseSet } from 'astronomy-engine';

import { computeAstronomy } from '../astronomy.js';
import { AstronomyComputationError, type AstronomyInput } from '../types.js';

const SEOUL = { lat: 37.5665, lon: 126.978 };
const KST_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\+09:00$/;

function baseInput(dateKstId: string, overrides: Partial<AstronomyInput> = {}): AstronomyInput {
  return { dateKstId, lat: SEOUL.lat, lon: SEOUL.lon, ...overrides };
}

describe('computeAstronomy — 달 조도 (BR1.1)', () => {
  it('신월 근처 날짜는 조도가 0%에 가깝다', () => {
    const r = computeAstronomy(baseInput('2026-11-09'));
    expect(r.moonIlluminationPct).toBeGreaterThanOrEqual(0);
    expect(r.moonIlluminationPct).toBeLessThan(5);
  });

  it('보름 근처 날짜는 조도가 100%에 가깝다', () => {
    const r = computeAstronomy(baseInput('2026-11-24'));
    expect(r.moonIlluminationPct).toBeGreaterThan(95);
    expect(r.moonIlluminationPct).toBeLessThanOrEqual(100);
  });

  it('중간 위상 날짜는 조도가 중간값(약 50%)이다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    expect(r.moonIlluminationPct).toBeGreaterThan(40);
    expect(r.moonIlluminationPct).toBeLessThan(60);
  });

  it('조도는 라이브러리 출력(범위 시작 시점=그날 일몰)과 소수 1자리 반올림으로 일치한다', () => {
    const dateKstId = '2026-11-17';
    const r = computeAstronomy(baseInput(dateKstId));
    // 범위 시작 = 그날 실제 일몰(태양 고도 0도 하강 교차, 고정 18:00 아님).
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const noonUtc = new Date('2026-11-17T03:00:00Z'); // KST 정오
    const sunset = SearchAltitude(Body.Sun, obs, -1, noonUtc, 1.5, 0);
    const startUtc = (sunset as { date: Date }).date;
    const expected = Math.round(Illumination(Body.Moon, startUtc).phase_fraction * 1000) / 10;
    expect(r.moonIlluminationPct).toBeCloseTo(expected, 1);
  });

  it('조도는 월출/월몰 유무와 무관하게 항상 실제값이다', () => {
    // 월출/월몰이 범위 밖인 좁은 밤 범위를 줘도 조도는 실제값.
    const r = computeAstronomy(
      baseInput('2026-11-24', {
        nightStartKst: '2026-11-24T20:00:00',
        nightEndKst: '2026-11-24T20:10:00',
      }),
    );
    expect(r.moonIlluminationPct).toBeGreaterThan(95);
  });
});

describe('computeAstronomy — 박명 3종 (BR2.1)', () => {
  it('일반 위도·날짜에서 박명 3종 경계가 존재하고 KST ISO 형식이다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    for (const win of [r.civilTwilight, r.nauticalTwilight, r.astronomicalTwilight]) {
      expect(win.start).toMatch(KST_ISO_RE);
      expect(win.end).toMatch(KST_ISO_RE);
    }
  });

  it('박명 경계가 성립하지 않는 고위도 백야에서는 null을 반환한다', () => {
    const r = computeAstronomy({
      dateKstId: '2026-06-21',
      lat: 69.65,
      lon: 18.96,
      nightStartKst: '2026-06-21T18:00:00+00:00',
      nightEndKst: '2026-06-22T06:00:00+00:00',
    });
    // 백야: 천문박명 경계 미성립 → null.
    expect(r.astronomicalTwilight.start).toBeNull();
    expect(r.astronomicalTwilight.end).toBeNull();
  });
});

describe('computeAstronomy — 완전한 밤 (BR2.2)', () => {
  it('일반 밤에는 완전한 밤 시각 쌍이 성립한다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    expect(r.fullDarkStart).toMatch(KST_ISO_RE);
    expect(r.fullDarkEnd).toMatch(KST_ISO_RE);
    // 시작이 끝보다 앞선다.
    expect(new Date(r.fullDarkStart as string).getTime()).toBeLessThan(
      new Date(r.fullDarkEnd as string).getTime(),
    );
  });

  it('천문박명이 성립하지 않으면 완전한 밤은 null 쌍이다', () => {
    const r = computeAstronomy({
      dateKstId: '2026-06-21',
      lat: 69.65,
      lon: 18.96,
      nightStartKst: '2026-06-21T18:00:00+00:00',
      nightEndKst: '2026-06-22T06:00:00+00:00',
    });
    expect(r.fullDarkStart).toBeNull();
    expect(r.fullDarkEnd).toBeNull();
  });
});

describe('computeAstronomy — 월출/월몰 "그날 밤" 범위 (BR3.1, BR3.2)', () => {
  it('기본 범위에서 월출/월몰이 범위 안이면 KST ISO 시각을 반환한다', () => {
    // 라이브러리로 2026-11-17 밤의 월출/월몰 교차 확인.
    const r = computeAstronomy(baseInput('2026-11-17'));
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const startUtc = new Date('2026-11-17T09:00:00Z'); // KST 18:00
    const endUtc = new Date('2026-11-18T06:00:00Z').getTime() - 9 * 3600000; // KST 익일 06:00
    const libRise = SearchRiseSet(Body.Moon, obs, +1, startUtc, 1.5);
    const riseInRange =
      libRise && libRise.date.getTime() >= startUtc.getTime() && libRise.date.getTime() <= endUtc;
    if (riseInRange) {
      expect(r.moonrise).toMatch(KST_ISO_RE);
    } else {
      expect(r.moonrise).toBeNull();
    }
  });

  it('월출/월몰이 "그날 밤" 범위 밖이면 null이다', () => {
    // 라이브러리로 실제 월출/월몰이 없는 좁은 1분 창을 골라 범위 밖을 보장한다.
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const dayStartUtc = new Date('2026-11-17T09:00:00Z');
    const rise = SearchRiseSet(Body.Moon, obs, +1, dayStartUtc, 1.5);
    const set = SearchRiseSet(Body.Moon, obs, -1, dayStartUtc, 1.5);
    // 월출·월몰 교차 시각에서 멀리 떨어진 KST 벽시계 1분 창을 고른다.
    // 월출/월몰 어느 쪽도 걸치지 않는 창을 탐색.
    const toKstWall = (utc: Date): string => {
      const kst = new Date(utc.getTime() + 9 * 3600000);
      // kst의 UTC 필드가 곧 KST 벽시계 시각이다. 오프셋 없는 분 단위 문자열로.
      return kst.toISOString().slice(0, 16);
    };
    let chosenStartUtc: Date | null = null;
    for (let h = 0; h < 24 && chosenStartUtc === null; h++) {
      const wStartUtc = new Date(Date.UTC(2026, 10, 17, h - 9, 30, 0));
      const wEndUtc = new Date(wStartUtc.getTime() + 60000);
      const riseIn =
        rise &&
        rise.date.getTime() >= wStartUtc.getTime() &&
        rise.date.getTime() <= wEndUtc.getTime();
      const setIn =
        set && set.date.getTime() >= wStartUtc.getTime() && set.date.getTime() <= wEndUtc.getTime();
      if (!riseIn && !setIn) {
        chosenStartUtc = wStartUtc;
      }
    }
    expect(chosenStartUtc).not.toBeNull();
    const startUtc = chosenStartUtc as Date;
    const startKst = toKstWall(startUtc);
    const endKst = toKstWall(new Date(startUtc.getTime() + 60000));
    const r = computeAstronomy(
      baseInput('2026-11-17', {
        nightStartKst: startKst,
        nightEndKst: endKst,
      }),
    );
    expect(r.moonrise).toBeNull();
    expect(r.moonset).toBeNull();
  });

  it('월출/월몰은 서로 독립적으로 null일 수 있다(월몰은 월출 이후에서 탐색)', () => {
    // 결함 6 수정 반영: 월몰은 range.startUtc가 아니라 월출(있으면) 이후부터
    // 탐색한다. 라이브러리로 동일한 탐색 순서를 재현해 교차 확인한다.
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const startUtc = new Date('2026-11-11T09:00:00Z');
    const endUtc = startUtc.getTime() + 12 * 3600000; // 18:00 ~ 익일 06:00
    const rise = SearchRiseSet(Body.Moon, obs, +1, startUtc, 1.5);
    const riseIn =
      rise && rise.date.getTime() >= startUtc.getTime() && rise.date.getTime() <= endUtc;
    // 월몰 탐색 기준: 월출이 있으면 그 이후, 없으면 범위 시작.
    const setSearchFrom = rise ? rise.date : startUtc;
    const set = SearchRiseSet(Body.Moon, obs, -1, setSearchFrom, 1.5);
    const setIn = set && set.date.getTime() >= startUtc.getTime() && set.date.getTime() <= endUtc;

    const r = computeAstronomy(baseInput('2026-11-11'));
    expect(r.moonrise === null).toBe(!riseIn);
    expect(r.moonset === null).toBe(!setIn);
  });
});

describe('computeAstronomy — KST 변환·반올림 (BR4.1, BR4.2)', () => {
  it('모든 시각은 분 단위 KST ISO(+09:00) 문자열이다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    const times = [
      r.civilTwilight.start,
      r.civilTwilight.end,
      r.fullDarkStart,
      r.fullDarkEnd,
    ].filter((t): t is string => t !== null);
    expect(times.length).toBeGreaterThan(0);
    for (const t of times) {
      expect(t).toMatch(KST_ISO_RE);
      // 초 단위가 없다(분 단위 반올림).
      expect(t).not.toMatch(/:\d{2}:\d{2}/);
    }
  });

  it('조도는 소수 1자리 이하로 반올림된다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    expect(Math.round(r.moonIlluminationPct * 10)).toBe(r.moonIlluminationPct * 10);
  });

  it('dateKstId는 입력을 그대로 반영한다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    expect(r.dateKstId).toBe('2026-11-17');
  });
});

describe('computeAstronomy — 입력 검증 (BR5.1, SD1)', () => {
  it('형식이 잘못된 dateKstId는 AstronomyComputationError를 던진다', () => {
    expect(() => computeAstronomy(baseInput('2026/11/17'))).toThrow(AstronomyComputationError);
  });

  it('실재하지 않는 날짜(2026-02-30)는 오류다', () => {
    expect(() => computeAstronomy(baseInput('2026-02-30'))).toThrow(AstronomyComputationError);
  });

  it('범위를 벗어난 위도는 오류이며 code/retryable을 담는다', () => {
    try {
      computeAstronomy(baseInput('2026-11-17', { lat: 120 } as Partial<AstronomyInput>));
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AstronomyComputationError);
      expect((err as AstronomyComputationError).code).toBe('astronomy_failed');
      expect((err as AstronomyComputationError).retryable).toBe(true);
    }
  });

  it('범위를 벗어난 경도는 오류다', () => {
    expect(() => computeAstronomy(baseInput('2026-11-17', { lon: -200 }))).toThrow(
      AstronomyComputationError,
    );
  });

  it('반쪽만 제공된 night 경계는 오류다', () => {
    expect(() =>
      computeAstronomy(baseInput('2026-11-17', { nightStartKst: '2026-11-17T18:00:00' })),
    ).toThrow(AstronomyComputationError);
  });

  it('start >= end 인 night 경계는 오류다', () => {
    expect(() =>
      computeAstronomy(
        baseInput('2026-11-17', {
          nightStartKst: '2026-11-17T06:00:00',
          nightEndKst: '2026-11-17T06:00:00',
        }),
      ),
    ).toThrow(AstronomyComputationError);
  });
});

describe('computeAstronomy — 기본 밤 범위 (BR3.2, 일몰~일출 기준)', () => {
  it('night 입력이 없으면 그날 실제 일몰~다음 일출 범위로 계산하며 결과를 반환한다', () => {
    const r = computeAstronomy(baseInput('2026-11-17'));
    expect(r).toBeDefined();
    expect(r.dateKstId).toBe('2026-11-17');
    // 라이브러리로 SearchAltitude(-6, dusk) 교차 확인: 일몰 전후로 저녁 박명이 있다.
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const noonUtc = new Date('2026-11-17T03:00:00Z'); // KST 정오부터 탐색
    const dusk = SearchAltitude(Body.Sun, obs, -1, noonUtc, 1.5, -6);
    expect(dusk).not.toBeNull();
    expect(r.civilTwilight.start).toMatch(KST_ISO_RE);
  });

  it('달이 밤 범위 안에서 남중을 지나지 않아도(늦게 뜨는 달) 밤 전체(일몰~일출)를 담는다', () => {
    // 종전 결함 재현 사례: 고정 18:00~06:00이면 늦게 뜨는 달의 남중이
    // 범위 밖으로 밀려 단조 증가 곡선이 됐다. 이제는 일몰~일출 전체를
    // 담으므로 moonHourly 시간 범위가 12시간보다 넓을 수 있다(계절별).
    const r = computeAstronomy(baseInput('2026-11-17'));
    const first = r.moonHourly[0];
    const last = r.moonHourly[r.moonHourly.length - 1];
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    // 밤 범위 시작/끝이 civilTwilight 시작보다 이르거나 같다(일몰이 civil 박명 시작보다 이름).
    if (r.civilTwilight.start !== null) {
      expect(new Date(first.hourKst).getTime()).toBeLessThanOrEqual(
        new Date(r.civilTwilight.start).getTime(),
      );
    }
  });
});
