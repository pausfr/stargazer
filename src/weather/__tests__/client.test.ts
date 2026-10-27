/**
 * u2-weather-data client 단위 테스트 (test-after).
 *
 * 실제 네트워크 호출 금지(Q3): 페이크 fetch를 주입해 성공/HTTP오류/
 * 타임아웃(abort)/파싱불가/구름량 결측을 재현한다(BR2.1·BR2.2·BR4.1).
 */

import { describe, expect, it } from 'vitest';

import { WeatherClient, type FetchLike } from '../client.js';
import type { CloudForecastQuery } from '../types.js';

const query: CloudForecastQuery = { dateKstId: '2026-11-17', lat: 37.5665, lon: 126.978 };

/** ok=true, 주어진 payload를 json으로 돌려주는 페이크 fetch. */
function okFetch(payload: unknown): FetchLike {
  return async () => ({ ok: true, status: 200, json: async () => payload });
}

const validPayload = {
  hourly: {
    time: ['2026-11-17T18:00', '2026-11-17T19:00'],
    cloud_cover: [20, 35],
  },
};

describe('WeatherClient.fetchCloudForecast (네트워크 미호출)', () => {
  it('성공 + 구름량 존재 → known, hourly 채움(오프셋 없는 응답에 KST +09:00을 명시)', async () => {
    const client = new WeatherClient({ fetchImpl: okFetch(validPayload) });
    const result = await client.fetchCloudForecast(query);
    expect(result.status).toBe('known');
    // Open-Meteo는 timezone=Asia/Seoul로 요청해도 오프셋 없는 벽시계 문자열을
    // 돌려준다("2026-11-17T18:00"). 이를 그대로 Date.parse하면 UTC로 오해석되어
    // 9시간이 밀리는 결함이 있었다 — +09:00을 명시해 KST로 고정한다.
    expect(result.hourlyCloudPct).toEqual([
      { hourKst: '2026-11-17T18:00:00+09:00', cloudPct: 20 },
      { hourKst: '2026-11-17T19:00:00+09:00', cloudPct: 35 },
    ]);
    expect(result.reason).toBeNull();
  });

  it('응답 시각에 이미 오프셋이 있으면 그대로 둔다(상위 호환)', async () => {
    const client = new WeatherClient({
      fetchImpl: okFetch({
        hourly: { time: ['2026-11-17T18:00:00+09:00'], cloud_cover: [20] },
      }),
    });
    const result = await client.fetchCloudForecast(query);
    expect(result.hourlyCloudPct).toEqual([{ hourKst: '2026-11-17T18:00:00+09:00', cloudPct: 20 }]);
  });

  it('HTTP 오류(ok=false) → unknown', async () => {
    const client = new WeatherClient({
      fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }),
    });
    const result = await client.fetchCloudForecast(query);
    expect(result.status).toBe('unknown');
    expect(result.hourlyCloudPct).toBeNull();
    expect(result.reason).toContain('503');
  });

  it('타임아웃(abort) → unknown reason=timeout', async () => {
    const abortingFetch: FetchLike = (input, init) =>
      new Promise((resolve, reject) => {
        void input;
        void resolve;
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    const client = new WeatherClient({ fetchImpl: abortingFetch, timeoutMs: 5 });
    const result = await client.fetchCloudForecast(query);
    expect(result.status).toBe('unknown');
    expect(result.reason).toBe('timeout');
  });

  it('호출 자체 실패(reject) → unknown reason=fetch failed', async () => {
    const client = new WeatherClient({
      fetchImpl: async () => {
        throw new Error('network down');
      },
    });
    const result = await client.fetchCloudForecast(query);
    expect(result.status).toBe('unknown');
    expect(result.reason).toBe('fetch failed');
  });

  it('파싱 불가(json 예외) → unknown', async () => {
    const client = new WeatherClient({
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('invalid json');
        },
      }),
    });
    const result = await client.fetchCloudForecast(query);
    expect(result.status).toBe('unknown');
    expect(result.reason).toBe('unparseable response');
  });

  it('구름량 필드 결측/형식 불일치 → unknown', async () => {
    const client = new WeatherClient({
      fetchImpl: okFetch({ hourly: { time: [], cloud_cover: [] } }),
    });
    const result = await client.fetchCloudForecast(query);
    expect(result.status).toBe('unknown');
    expect(result.reason).toBe('cloud cover missing');
  });
});
