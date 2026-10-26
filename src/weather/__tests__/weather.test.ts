/**
 * u2-weather-data weather(WF1) 단위 테스트 (test-after).
 *
 * 시각은 주입 nowMs로 고정(실시간 Date.now() 의존 금지). 컷오프(오늘+14 vs +15)·
 * 캐시 히트·TTL 만료·검증 실패를 결정적으로 검증하며, 실제 네트워크는
 * 호출하지 않는다(Q3). fetch 호출 여부를 스파이로 단언한다.
 */

import { describe, expect, it, vi } from 'vitest';

import { getCloudForecast } from '../weather.js';
import { DataCache, SHORT_TTL_MS } from '../cache.js';
import { WeatherClient, type FetchLike } from '../client.js';
import type { CloudForecastQuery } from '../types.js';

// 기준 '오늘': 2026-11-17 KST 정오 근방으로 고정.
const NOW_MS = Date.UTC(2026, 10, 17, 3, 0, 0); // 12:00 KST
const COORD = { lat: 37.5665, lon: 126.978 };

function query(dateKstId: string): CloudForecastQuery {
  return { dateKstId, ...COORD };
}

const validPayload = {
  hourly: { time: ['2026-11-17T18:00'], cloud_cover: [10] },
};

/** 호출 횟수를 세는 스파이 fetch(항상 성공 payload 반환). */
function spyFetch(payload: unknown = validPayload): { impl: FetchLike; calls: () => number } {
  const fn = vi.fn(async () => ({ ok: true, status: 200, json: async () => payload }));
  return { impl: fn as unknown as FetchLike, calls: () => fn.mock.calls.length };
}

describe('getCloudForecast — 검증 게이트 (SD1)', () => {
  it('잘못된 입력은 외부 호출 없이 unknown(reason="invalid input")', async () => {
    const spy = spyFetch();
    const cache = new DataCache();
    const result = await getCloudForecast(query('2026-02-30'), {
      nowMs: NOW_MS,
      cache,
      client: new WeatherClient({ fetchImpl: spy.impl }),
    });
    expect(result.status).toBe('unknown');
    expect(result.reason).toBe('invalid input');
    expect(spy.calls()).toBe(0);
  });
});

describe('getCloudForecast — 14일 사전 컷오프 (BR1.1)', () => {
  it('오늘+14일은 범위 안 → 호출(known)', async () => {
    const spy = spyFetch();
    const result = await getCloudForecast(query('2026-12-01'), {
      nowMs: NOW_MS,
      cache: new DataCache(),
      client: new WeatherClient({ fetchImpl: spy.impl }),
    });
    expect(result.status).toBe('known');
    expect(spy.calls()).toBe(1);
  });

  it('오늘+15일은 범위 밖 → 호출 없이 outOfHorizon', async () => {
    const spy = spyFetch();
    const result = await getCloudForecast(query('2026-12-02'), {
      nowMs: NOW_MS,
      cache: new DataCache(),
      client: new WeatherClient({ fetchImpl: spy.impl }),
    });
    expect(result.status).toBe('outOfHorizon');
    expect(result.hourlyCloudPct).toBeNull();
    expect(spy.calls()).toBe(0);
  });
});

describe('getCloudForecast — 외부 호출 결과 (BR1.2·BR2.1)', () => {
  it('14일 이내 성공 → known', async () => {
    const spy = spyFetch();
    const result = await getCloudForecast(query('2026-11-18'), {
      nowMs: NOW_MS,
      cache: new DataCache(),
      client: new WeatherClient({ fetchImpl: spy.impl }),
    });
    expect(result.status).toBe('known');
  });

  it('14일 이내 실패 → unknown', async () => {
    const failFetch: FetchLike = async () => ({ ok: false, status: 500, json: async () => ({}) });
    const result = await getCloudForecast(query('2026-11-18'), {
      nowMs: NOW_MS,
      cache: new DataCache(),
      client: new WeatherClient({ fetchImpl: failFetch }),
    });
    expect(result.status).toBe('unknown');
  });
});

describe('getCloudForecast — 캐시와 재시도 (BR3.1·BR3.2)', () => {
  it('캐시 히트 시 외부 호출 없음', async () => {
    const spy = spyFetch();
    const cache = new DataCache();
    const client = new WeatherClient({ fetchImpl: spy.impl });
    await getCloudForecast(query('2026-11-18'), { nowMs: NOW_MS, cache, client });
    await getCloudForecast(query('2026-11-18'), { nowMs: NOW_MS + 1000, cache, client });
    expect(spy.calls()).toBe(1); // 두 번째는 캐시 히트.
  });

  it('unknown의 짧은 TTL 만료 후 재진입하면 다시 호출(BR3.2)', async () => {
    let okNext = false;
    const flakyFetch: FetchLike = async () =>
      okNext
        ? { ok: true, status: 200, json: async () => validPayload }
        : { ok: false, status: 500, json: async () => ({}) };
    const fn = vi.fn(flakyFetch);
    const cache = new DataCache();
    const client = new WeatherClient({ fetchImpl: fn as unknown as FetchLike });

    const first = await getCloudForecast(query('2026-11-18'), { nowMs: NOW_MS, cache, client });
    expect(first.status).toBe('unknown');

    // 짧은 TTL 만료 후 재진입: 캐시 미스 → 재호출.
    okNext = true;
    const second = await getCloudForecast(query('2026-11-18'), {
      nowMs: NOW_MS + SHORT_TTL_MS + 1,
      cache,
      client,
    });
    expect(second.status).toBe('known');
    expect(fn.mock.calls.length).toBe(2);
  });

  it('outOfHorizon 캐시는 자정을 넘기면 만료된다(지평 경계 stale 방지)', async () => {
    const spy = spyFetch();
    const cache = new DataCache();
    const client = new WeatherClient({ fetchImpl: spy.impl });

    // 2026-11-17 23:50 KST(= UTC 14:50)에 오늘+15일(2026-12-02) 조회 → outOfHorizon 캐시.
    const lateNightMs = Date.UTC(2026, 10, 17, 14, 50, 0);
    const first = await getCloudForecast(query('2026-12-02'), {
      nowMs: lateNightMs,
      cache,
      client,
    });
    expect(first.status).toBe('outOfHorizon');
    expect(spy.calls()).toBe(0);

    // 40분 뒤(2026-11-18 00:30 KST): 자정을 넘겨 같은 날짜가 오늘+14일로 들어옴.
    // outOfHorizon TTL이 자정까지로 제한되어 캐시 미스 → 재호출(known).
    const afterMidnightMs = lateNightMs + 40 * 60 * 1000;
    const second = await getCloudForecast(query('2026-12-02'), {
      nowMs: afterMidnightMs,
      cache,
      client,
    });
    expect(second.status).toBe('known');
    expect(spy.calls()).toBe(1); // 자정 교차 후 재호출됨.
  });
});
