/**
 * u2-weather-data cache 단위 테스트 (test-after).
 *
 * TTL 캐시의 결정적 만료(주입 nowMs)·상태별 차등 TTL·키 구분을 검증한다(BR3.1).
 */

import { describe, expect, it } from 'vitest';

import { DataCache, LONG_TTL_MS, SHORT_TTL_MS, cacheKey, ttlForForecast } from '../cache.js';
import { knownForecast, unknownForecast, outOfHorizonForecast } from '../types.js';

const BASE_MS = 1_700_000_000_000;
const hourly = [{ hourKst: '2026-11-17T18:00+09:00', cloudPct: 10 }];

describe('cacheKey', () => {
  it('날짜·좌표를 결합하며 좌표가 다르면 키가 다르다', () => {
    const a = cacheKey('2026-11-17', 37.5665, 126.978);
    const b = cacheKey('2026-11-17', 35.1796, 129.0756);
    const sameDateDiffCoord = a !== b;
    expect(sameDateDiffCoord).toBe(true);
  });

  it('날짜가 다르면 키가 다르다', () => {
    expect(cacheKey('2026-11-17', 37.5665, 126.978)).not.toBe(
      cacheKey('2026-11-18', 37.5665, 126.978),
    );
  });
});

describe('ttlForForecast (BR3.1)', () => {
  it('known/outOfHorizon은 긴 TTL, unknown은 짧은 TTL', () => {
    expect(ttlForForecast(knownForecast('2026-11-17', hourly))).toBe(LONG_TTL_MS);
    expect(ttlForForecast(outOfHorizonForecast('2026-12-30'))).toBe(LONG_TTL_MS);
    expect(ttlForForecast(unknownForecast('2026-11-18', 'timeout'))).toBe(SHORT_TTL_MS);
  });
});

describe('DataCache get/set (BR3.1)', () => {
  it('TTL 이내 저장 직후는 히트', () => {
    const cache = new DataCache();
    const key = cacheKey('2026-11-17', 37.5665, 126.978);
    const forecast = knownForecast('2026-11-17', hourly);
    cache.set(key, forecast, LONG_TTL_MS, BASE_MS);
    expect(cache.get(key, BASE_MS + 1000)).toEqual(forecast);
  });

  it('TTL 초과는 미스', () => {
    const cache = new DataCache();
    const key = cacheKey('2026-11-17', 37.5665, 126.978);
    cache.set(key, knownForecast('2026-11-17', hourly), LONG_TTL_MS, BASE_MS);
    expect(cache.get(key, BASE_MS + LONG_TTL_MS)).toBeNull();
    expect(cache.get(key, BASE_MS + LONG_TTL_MS + 1)).toBeNull();
  });

  it('unknown의 짧은 TTL은 known의 긴 TTL보다 먼저 만료된다', () => {
    const cache = new DataCache();
    const knownKey = cacheKey('2026-11-17', 1, 1);
    const unknownKey = cacheKey('2026-11-18', 1, 1);
    cache.set(knownKey, knownForecast('2026-11-17', hourly), LONG_TTL_MS, BASE_MS);
    cache.set(unknownKey, unknownForecast('2026-11-18', 'timeout'), SHORT_TTL_MS, BASE_MS);

    // 짧은 TTL 경과 후: unknown은 미스, known은 아직 히트.
    const afterShort = BASE_MS + SHORT_TTL_MS + 1;
    expect(cache.get(unknownKey, afterShort)).toBeNull();
    expect(cache.get(knownKey, afterShort)).not.toBeNull();
  });

  it('없는 키는 미스', () => {
    const cache = new DataCache();
    expect(cache.get('missing', BASE_MS)).toBeNull();
  });
});
