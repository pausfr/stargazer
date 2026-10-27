// @vitest-environment happy-dom
/**
 * Step 14(일부) — Frontend DOM 로직 테스트 (happy-dom).
 *
 * 상태→표시 문구 매핑과 재시도 상태 전이를 DOM 수준에서 검증한다: outOfHorizon
 * "먼 날짜" 안내, partial "구름량 알 수 없음" 안내, 요약 null→"없음" 표기,
 * astroError → 에러+재시도 후 재조립 성공 전이. 실제 Chart.js 그리기는 제외.
 *
 * domain-rules의 listCandidateDates와 assembler.assembleNightView를 mock해
 * 외부 API/실제 계산에 의존하지 않는다.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CalendarDate } from '../../domain-rules/index.js';
import { makeAstro, makeCalendar, makeCloudOutOfHorizon, makeCloudUnknown } from './fixtures.js';
import type { NightView } from '../types.js';

const CAL = makeCalendar({ dateKstId: '2026-01-01' });

vi.mock('../../domain-rules/index.js', async (orig) => {
  const actual = await orig<typeof import('../../domain-rules/index.js')>();
  return {
    ...actual,
    listCandidateDates: vi.fn((): CalendarDate[] => [CAL]),
  };
});

const assembleMock = vi.fn();
vi.mock('../assembler.js', () => ({
  assembleNightView: (...args: unknown[]) => assembleMock(...args),
}));

// chart.ts는 canvas 2d 컨텍스트를 요구하므로 DOM 테스트에서 그리기를 무력화.
vi.mock('../chart.js', () => ({
  NightChart: class {
    render(): void {}
    destroy(): void {}
  },
}));

import { renderDetailView, type DetailViewContext } from '../detailView.js';
import { DataCache } from '../../weather/index.js';

function ctx(): DetailViewContext {
  return { cache: new DataCache(), nowMs: 1_767_225_600_000, fromKstId: '2026-01-01', months: 3 };
}

function okView(overrides: Partial<NightView> = {}): NightView {
  return {
    dateKstId: '2026-01-01',
    calendar: CAL,
    astro: makeAstro(),
    astroError: false,
    cloud: makeCloudOutOfHorizon(),
    verdict: null,
    state: 'ok',
    ...overrides,
  };
}

describe('renderDetailView (DOM)', () => {
  let root: HTMLElement;
  beforeEach(() => {
    assembleMock.mockReset();
    root = document.createElement('div');
    document.body.replaceChildren(root);
    window.location.hash = '';
  });

  it('outOfHorizon → "먼 날짜" 안내를 표시한다', async () => {
    assembleMock.mockResolvedValue(okView({ cloud: makeCloudOutOfHorizon() }));
    await renderDetailView(root, '2026-01-01', ctx(), () => {});
    const notice = root.querySelector('[data-testid="far-date-notice"]');
    expect(notice).not.toBeNull();
    expect(notice?.textContent).toContain('가까워지면');
  });

  it('partial → "구름량 알 수 없음" 안내를 표시한다', async () => {
    assembleMock.mockResolvedValue(okView({ cloud: makeCloudUnknown(), state: 'partial' }));
    await renderDetailView(root, '2026-01-01', ctx(), () => {});
    const notice = root.querySelector('[data-testid="partial-notice"]');
    expect(notice?.textContent).toBe('구름량 알 수 없음');
  });

  it('요약: 월출/월몰/완전한 밤 null → 라벨+"-"으로 명시(AC3.2.3, 3번 중복 제거)', async () => {
    assembleMock.mockResolvedValue(
      okView({
        astro: makeAstro({ moonrise: null, moonset: null, fullDarkStart: null, fullDarkEnd: null }),
      }),
    );
    await renderDetailView(root, '2026-01-01', ctx(), () => {});
    // 라벨 span("월출")과 값 span("-")이 분리 렌더된다
    // (종전 "월몰 월몰 없음" 중복 제거 — 값은 "-"만).
    const moonrise = root.querySelector('[data-testid="summary-moonrise"]');
    expect(moonrise?.querySelector('.summary-label')?.textContent).toBe('월출');
    expect(moonrise?.querySelector('.summary-value')?.textContent).toBe('-');

    // 값에 라벨이 중복되지 않는다("월몰"은 라벨 span에만 1회 등장, 3번 회귀).
    const moonset = root.querySelector('[data-testid="summary-moonset"]');
    expect(moonset?.querySelector('.summary-label')?.textContent).toBe('월몰');
    expect(moonset?.querySelector('.summary-value')?.textContent).toBe('-');

    const fullDark = root.querySelector('[data-testid="summary-full-dark"]');
    expect(fullDark?.querySelector('.summary-label')?.textContent).toBe('완전한 밤');
    expect(fullDark?.querySelector('.summary-value')?.textContent).toBe('-');
  });

  it('astroError → 에러+재시도 노출, 재시도 탭 시 재조립 성공으로 전이', async () => {
    assembleMock
      .mockResolvedValueOnce(okView({ astro: null, astroError: true, state: 'error' }))
      .mockResolvedValueOnce(okView());
    await renderDetailView(root, '2026-01-01', ctx(), () => {});
    const retry = root.querySelector('[data-testid="retry-button"]') as HTMLButtonElement | null;
    expect(retry).not.toBeNull();
    expect(root.querySelector('[data-testid="detail-error"]')).not.toBeNull();

    retry?.click();
    // 재조립은 비동기이므로 microtask 큐를 비운다.
    await Promise.resolve();
    await Promise.resolve();
    expect(root.querySelector('[data-testid="detail-error"]')).toBeNull();
    expect(root.querySelector('[data-testid="detail-content"]')).not.toBeNull();
  });
});
