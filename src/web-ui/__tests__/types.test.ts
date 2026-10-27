/**
 * Step 4 — 데이터 모델(뷰모델) 테스트.
 *
 * ViewState 값 집합과 DEFAULT_LOCATION 상수, NightView 조립 형태의 기본
 * 불변식을 가드한다(functional-spec §2). 순수 형태 검증.
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_LOCATION, type NightView, type ViewState } from '../types.js';

describe('types (view model)', () => {
  it('DEFAULT_LOCATION은 전국 대표 좌표(서울) 상수다', () => {
    expect(DEFAULT_LOCATION.lat).toBeCloseTo(37.5665, 4);
    expect(DEFAULT_LOCATION.lon).toBeCloseTo(126.978, 4);
  });

  it('ViewState는 loading/ok/partial/error 4값으로 좁혀진다', () => {
    const states: ViewState[] = ['loading', 'ok', 'partial', 'error'];
    expect(new Set(states).size).toBe(4);
  });

  it('NightView는 calendar·astro·cloud·verdict·state 필드를 갖는 조립 형태다', () => {
    const view: NightView = {
      dateKstId: '2026-01-01',
      calendar: {
        dateKstId: '2026-01-01',
        label: '신정',
        isHoliday: true,
        isWeekend: false,
        holidayCoverage: 'covered',
        nightStartKst: '2026-01-01T18:00:00+09:00',
        nightEndKst: '2026-01-02T06:00:00+09:00',
      },
      astro: null,
      astroError: true,
      cloud: { dateKstId: '2026-01-01', status: 'unknown', hourlyCloudPct: null, reason: 'x' },
      verdict: null,
      state: 'error',
    };
    expect(view.dateKstId).toBe('2026-01-01');
    expect(view.astroError).toBe(true);
    expect(view.state).toBe('error');
  });
});
