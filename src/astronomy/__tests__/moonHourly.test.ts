/**
 * u1-astronomy 재작업 회귀 테스트 (test-after, C1 확장 + 결함 6 수정).
 *
 * Fix A — moonHourly(시간별 달 체감 밝기):
 *  - 남중(최대 고도) 시각 ≈ 100%.
 *  - 고도 ≤ 0인 시각 = 0%.
 *  - 월출→남중 단조 증가, 남중→월몰 단조 감소(대기 소광·입사각 단조성).
 *  - 월출/월몰 근처는 남중 대비 낮음.
 * Fix B — computeMoonRiseSet 대칭성:
 *  - 월출이 있으면 월몰도 같은 밤에서 탐색된다(비대칭 인공 결과 재발 방지).
 *
 * 좌표: 서울 대표 좌표. 기준 날짜는 결정적 실제값으로 교차 확인한다.
 *  - 2026-11-26 KST 밤: 월출 18:33, 밤 동안 상승 → 02:30 남중(최대 고도) → 하강.
 *  - 2026-11-17 KST 밤: 달이 초저녁 이미 떠 있고 자정 전 월몰 → 하강 위주.
 */

import { describe, expect, it } from 'vitest';
import { Body, Observer, SearchRiseSet } from 'astronomy-engine';

import { computeAstronomy } from '../astronomy.js';
import type { AstronomyInput, MoonHourlySample } from '../types.js';

const SEOUL = { lat: 37.5665, lon: 126.978 };
const KST_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\+09:00$/;

function baseInput(dateKstId: string, overrides: Partial<AstronomyInput> = {}): AstronomyInput {
  return { dateKstId, lat: SEOUL.lat, lon: SEOUL.lon, ...overrides };
}

/** 최대 상대 밝기를 가진 표본(남중에 해당). */
function peakSample(samples: MoonHourlySample[]): MoonHourlySample {
  return samples.reduce((a, b) => (b.relativeBrightnessPct >= a.relativeBrightnessPct ? b : a));
}

describe('moonHourly — 기본 형태 (C1 확장, §2.1)', () => {
  it('밤 범위를 약 30분 간격으로 샘플링하고 각 표본이 KST ISO·수치 필드를 갖는다', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    expect(r.moonHourly.length).toBeGreaterThan(10);
    for (const s of r.moonHourly) {
      expect(s.hourKst).toMatch(KST_ISO_RE);
      expect(typeof s.altitudeDeg).toBe('number');
      expect(s.relativeBrightnessPct).toBeGreaterThanOrEqual(0);
      expect(s.relativeBrightnessPct).toBeLessThanOrEqual(100);
    }
  });

  it('남중(최대 고도) 시각의 상대 밝기 피크가 그날 달 조도%에 맞춰진다(100% 아님)', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    const peak = peakSample(r.moonHourly);
    // 피크는 그날 달 조도(위상 밝기)에 비례한다. 30분 샘플 간격상 남중이
    // 정확히 샘플되지 않을 수 있어 약간 낮을 수 있으므로 상한으로 검증하고
    // 조도에 근접함을 확인한다.
    expect(peak.relativeBrightnessPct).toBeGreaterThan(0);
    expect(peak.relativeBrightnessPct).toBeLessThanOrEqual(r.moonIlluminationPct + 0.1);
    expect(peak.relativeBrightnessPct).toBeCloseTo(r.moonIlluminationPct, 0);
    // 최대 밝기 표본은 최대 고도 표본과 일치한다(단조 관계).
    const maxAlt = Math.max(...r.moonHourly.map((s) => s.altitudeDeg));
    expect(peak.altitudeDeg).toBeCloseTo(maxAlt, 5);
  });

  it('고도 ≤ 0(지평 아래)인 시각의 상대 밝기는 0%이다', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    for (const s of r.moonHourly) {
      if (s.altitudeDeg <= 0) {
        expect(s.relativeBrightnessPct).toBe(0);
      }
    }
  });
});

describe('moonHourly — 단조성 (대기 소광·입사각)', () => {
  it('월출 이후 남중까지 상대 밝기가 단조 증가한다', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    const peak = peakSample(r.moonHourly);
    const peakIdx = r.moonHourly.indexOf(peak);
    // 월출 후 첫 양(+) 고도 표본부터 남중까지 비감소.
    const rising = r.moonHourly.slice(0, peakIdx + 1).filter((s) => s.altitudeDeg > 0);
    for (let i = 1; i < rising.length; i++) {
      expect(rising[i].relativeBrightnessPct).toBeGreaterThanOrEqual(
        rising[i - 1].relativeBrightnessPct - 0.1,
      );
    }
    expect(rising.length).toBeGreaterThan(3);
  });

  it('남중 이후 월몰까지 상대 밝기가 단조 감소한다', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    const peak = peakSample(r.moonHourly);
    const peakIdx = r.moonHourly.indexOf(peak);
    const falling = r.moonHourly.slice(peakIdx).filter((s) => s.altitudeDeg > 0);
    for (let i = 1; i < falling.length; i++) {
      expect(falling[i].relativeBrightnessPct).toBeLessThanOrEqual(
        falling[i - 1].relativeBrightnessPct + 0.1,
      );
    }
    expect(falling.length).toBeGreaterThan(3);
  });

  it('월출 직후 저고도 시각은 남중 대비 현저히 낮다(대기 소광)', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    const lowAlt = r.moonHourly.find((s) => s.altitudeDeg > 0 && s.altitudeDeg < 10);
    expect(lowAlt).toBeDefined();
    expect((lowAlt as MoonHourlySample).relativeBrightnessPct).toBeLessThan(20);
  });
});

describe('computeMoonRiseSet — 대칭성 (결함 6 회귀)', () => {
  it('월출이 있으면 월몰도 같은 밤에서 탐색된다(월출만 있는 비대칭 인공 결과 없음)', () => {
    // 월출이 밤 범위 안이고 월몰이 월출 이후 범위 안에 있는 날을 라이브러리로
    // 교차 확인한 뒤, 결과가 그 사실과 일치하는지 본다.
    const r = computeAstronomy(baseInput('2026-11-17'));
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const startUtc = new Date('2026-11-17T09:00:00Z'); // KST 18:00
    const endMs = new Date('2026-11-18T09:00:00Z').getTime() - 24 * 3600000 + 12 * 3600000; // 익일 06:00 KST
    const rise = SearchRiseSet(Body.Moon, obs, +1, startUtc, 1.5);
    const riseInRange =
      rise && rise.date.getTime() >= startUtc.getTime() && rise.date.getTime() <= endMs;
    // 월출이 없는 날이라면 이 케이스는 적용되지 않으므로 월몰도 비대칭이 아님만 확인.
    if (riseInRange) {
      // 월출이 있다 → 월몰 탐색이 월출 이후부터 수행됐어야 한다.
      // (월몰은 범위 밖이어도 null 가능; 핵심은 "월출만 있고 월몰 탐색이 생략"이 없음.)
      const set = SearchRiseSet(Body.Moon, obs, -1, rise.date, 1.5);
      const setInRange =
        set && set.date.getTime() >= startUtc.getTime() && set.date.getTime() <= endMs;
      expect(r.moonset === null).toBe(!setInRange);
    } else {
      expect(r.moonrise).toBeNull();
    }
  });

  it('월출이 밤 범위 안인 날(2026-11-26)에 월출을 반환하고 월몰은 월출 이후에서 탐색된다', () => {
    const r = computeAstronomy(baseInput('2026-11-26'));
    expect(r.moonrise).toMatch(KST_ISO_RE);
    const obs = new Observer(SEOUL.lat, SEOUL.lon, 0);
    const riseUtc = new Date(Date.parse(r.moonrise as string));
    // 월몰 탐색이 월출 이후부터 수행됐음을 라이브러리로 교차 확인.
    const set = SearchRiseSet(Body.Moon, obs, -1, riseUtc, 1.5);
    const endUtcMs = Date.parse(r.moonrise as string) + 12 * 3600000;
    const setInRange =
      set &&
      set.date.getTime() >= riseUtc.getTime() &&
      set.date.getTime() <= new Date('2026-11-27T21:00:00Z').getTime() &&
      set.date.getTime() <= endUtcMs;
    // 월몰이 범위 밖이면 null(정상), 범위 안이면 값. 어느 쪽이든 "탐색 생략" 아님.
    expect(r.moonset === null).toBe(!setInRange);
  });
});
