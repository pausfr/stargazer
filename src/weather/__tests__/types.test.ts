/**
 * u2-weather-data types 단위 테스트 (test-after).
 *
 * 상태 생성 헬퍼의 3-상태 불변식(entities.md constraints, C2, BR2.2)을 검증한다.
 */

import { describe, expect, it } from 'vitest';

import {
  FORECAST_HORIZON_DAYS,
  knownForecast,
  outOfHorizonForecast,
  unknownForecast,
  type HourlyCloud,
} from '../types.js';

const sampleHourly: HourlyCloud[] = [
  { hourKst: '2026-11-17T18:00+09:00', cloudPct: 20 },
  { hourKst: '2026-11-17T19:00+09:00', cloudPct: 35 },
];

describe('상태 불변식 생성 헬퍼 (C2, BR2.2)', () => {
  it('knownForecast는 hourlyCloudPct를 채우고 reason=null로 둔다', () => {
    const f = knownForecast('2026-11-17', sampleHourly);
    expect(f.status).toBe('known');
    expect(f.hourlyCloudPct).toEqual(sampleHourly);
    expect(f.reason).toBeNull();
    expect(f.dateKstId).toBe('2026-11-17');
  });

  it('outOfHorizonForecast는 hourlyCloudPct=null, reason=null로 둔다(정상적 먼 날짜)', () => {
    const f = outOfHorizonForecast('2026-12-30');
    expect(f.status).toBe('outOfHorizon');
    expect(f.hourlyCloudPct).toBeNull();
    expect(f.reason).toBeNull();
  });

  it('unknownForecast는 hourlyCloudPct=null, reason에 내부 사유를 담는다', () => {
    const f = unknownForecast('2026-11-18', 'timeout');
    expect(f.status).toBe('unknown');
    expect(f.hourlyCloudPct).toBeNull();
    expect(f.reason).toBe('timeout');
  });
});

describe('FORECAST_HORIZON_DAYS 불변식 (BR1.3)', () => {
  it('컷오프는 14일이며 Open-Meteo forecast 범위(16일) 이하다', () => {
    expect(FORECAST_HORIZON_DAYS).toBe(14);
    expect(FORECAST_HORIZON_DAYS).toBeLessThanOrEqual(16);
  });
});
