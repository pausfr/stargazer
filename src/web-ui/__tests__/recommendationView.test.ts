/**
 * Step 10 — 추천 표시 매핑 테스트 (FR2.1, AC2.1.1~2.1.4, NFR1).
 *
 * 3 verdict → 강조 플래그/라벨/아이콘 매핑, 색 비의존(아이콘+라벨 병행)을
 * 검증한다.
 */

import { describe, it, expect } from 'vitest';
import { toRecommendationView, RECOMMENDED_LABEL } from '../recommendationView.js';
import { makeRecommendation } from './fixtures.js';

describe('toRecommendationView', () => {
  it('recommended → 노란 테두리 + 별 아이콘 + "추천" 라벨(3중, 색 비의존)', () => {
    const view = toRecommendationView(makeRecommendation({ verdict: 'recommended' }));
    expect(view.yellowBorder).toBe(true);
    expect(view.starIcon).toBe(true);
    expect(view.label).toBe(RECOMMENDED_LABEL);
    // 색(테두리)만이 아니라 형태(아이콘)와 텍스트(라벨)가 반드시 함께 있어야 한다.
    expect(view.starIcon && view.label.length > 0).toBe(true);
  });

  it('not_recommended → 강조 없음', () => {
    const view = toRecommendationView(makeRecommendation({ verdict: 'not_recommended' }));
    expect(view.yellowBorder).toBe(false);
    expect(view.starIcon).toBe(false);
    expect(view.label).toBe('');
  });

  it('deferred → 강조 없음(목록에서 제외하지 않음)', () => {
    const view = toRecommendationView(
      makeRecommendation({ verdict: 'deferred', reason: 'cloud unknown' }),
    );
    expect(view.yellowBorder).toBe(false);
    expect(view.starIcon).toBe(false);
    expect(view.label).toBe('');
  });

  it('null(판정 없음) → 강조 없음', () => {
    const view = toRecommendationView(null);
    expect(view).toEqual({ yellowBorder: false, starIcon: false, label: '' });
  });
});
