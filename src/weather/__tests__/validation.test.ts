/**
 * u2-weather-data validation 단위 테스트 (test-after).
 *
 * SD1 진입점 검증 게이트: 예외 없이 불리언 반환, fail-fast(SD1, BR2.1).
 */

import { describe, expect, it } from 'vitest';

import { isValidQuery } from '../validation.js';
import type { CloudForecastQuery } from '../types.js';

function query(overrides: Partial<CloudForecastQuery> = {}): CloudForecastQuery {
  return { dateKstId: '2026-11-17', lat: 37.5665, lon: 126.978, ...overrides };
}

describe('isValidQuery (SD1)', () => {
  it('유효한 입력은 true', () => {
    expect(isValidQuery(query())).toBe(true);
  });

  it('경계값 좌표(±90, ±180)도 유효', () => {
    expect(isValidQuery(query({ lat: 90, lon: 180 }))).toBe(true);
    expect(isValidQuery(query({ lat: -90, lon: -180 }))).toBe(true);
  });

  it('잘못된 날짜 형식은 false', () => {
    expect(isValidQuery(query({ dateKstId: '2026/11/17' }))).toBe(false);
    expect(isValidQuery(query({ dateKstId: '20261117' }))).toBe(false);
    expect(isValidQuery(query({ dateKstId: '' }))).toBe(false);
  });

  it('형식은 맞지만 실재하지 않는 날짜는 false', () => {
    expect(isValidQuery(query({ dateKstId: '2026-02-30' }))).toBe(false);
    expect(isValidQuery(query({ dateKstId: '2026-13-01' }))).toBe(false);
  });

  it('좌표 범위를 벗어나면 false', () => {
    expect(isValidQuery(query({ lat: 91 }))).toBe(false);
    expect(isValidQuery(query({ lat: -90.1 }))).toBe(false);
    expect(isValidQuery(query({ lon: 181 }))).toBe(false);
    expect(isValidQuery(query({ lon: Number.NaN }))).toBe(false);
  });

  it('좌표가 숫자가 아니면 false', () => {
    expect(isValidQuery(query({ lat: '37' as unknown as number }))).toBe(false);
  });

  it('예외를 던지지 않고 null/undefined 같은 입력도 false로 처리', () => {
    expect(isValidQuery(null as unknown as CloudForecastQuery)).toBe(false);
    expect(isValidQuery(undefined as unknown as CloudForecastQuery)).toBe(false);
  });
});
