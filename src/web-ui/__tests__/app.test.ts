/**
 * Step 14(일부) — 라우팅 순수 로직 테스트.
 *
 * @vitest-environment happy-dom
 *
 * 해시 라우트 파싱(#/ 목록, #/night/:dateKstId 상세)과 오늘 KST 날짜 키
 * 산출을 검증한다. DOM/AppRoot 인스턴스 동작은 수동 스모크.
 */

import { describe, it, expect } from 'vitest';
import { parseRoute, todayKstId } from '../app.js';

describe('parseRoute', () => {
  it('빈 해시/루트 → list', () => {
    expect(parseRoute('')).toEqual({ name: 'list' });
    expect(parseRoute('#/')).toEqual({ name: 'list' });
  });

  it('#/night/:dateKstId → detail', () => {
    expect(parseRoute('#/night/2026-01-01')).toEqual({ name: 'detail', dateKstId: '2026-01-01' });
  });

  it('잘못된 날짜 형식 → list로 폴백', () => {
    expect(parseRoute('#/night/bad')).toEqual({ name: 'list' });
  });
});

describe('todayKstId', () => {
  it('UTC 자정 직후도 KST(+9)로 당일 날짜를 돌려준다', () => {
    // 2026-01-01T00:00:00Z → KST 09:00 → 2026-01-01.
    const ms = Date.parse('2026-01-01T00:00:00Z');
    expect(todayKstId(ms)).toBe('2026-01-01');
  });

  it('UTC 16:00(= KST 익일 01:00)은 다음 날짜', () => {
    const ms = Date.parse('2026-01-01T16:00:00Z');
    expect(todayKstId(ms)).toBe('2026-01-02');
  });
});
