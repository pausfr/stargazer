/**
 * 추천 표시 매핑 (functional-spec §3, FR2.1, NFR1, AC2.1.1~2.1.4).
 *
 * 순수 함수. U3 Recommendation.verdict만 읽어 카드 강조 속성을 산출한다.
 * UI는 임계값/판정 로직을 갖지 않는다(U3 소유). 추천 강조는 색만으로
 * 전달하지 않으며(NFR1), 노란 테두리(색)·별 아이콘(형태)·"추천" 라벨(텍스트)을
 * 항상 함께 제공한다.
 */

import type { Recommendation } from './types.js';

/** 카드 강조 표시 속성(색 비의존: 테두리 + 아이콘 + 라벨). */
export interface RecommendationView {
  /** 노란 테두리 강조 여부. */
  yellowBorder: boolean;
  /** 별 아이콘 표시 여부(형태). */
  starIcon: boolean;
  /** 텍스트 라벨(강조 시 "추천", 그 외 빈 문자열). */
  label: string;
}

/** 강조 라벨 텍스트 상수. */
export const RECOMMENDED_LABEL = '추천';

const NO_EMPHASIS: RecommendationView = { yellowBorder: false, starIcon: false, label: '' };

/**
 * 추천 판정으로부터 카드 강조 속성을 매핑한다(AC2.1.1~2.1.4).
 *
 * - recommended → 노란 테두리 + 별 아이콘 + "추천" 라벨(3중, 색 비의존).
 * - not_recommended / deferred → 강조 없음(deferred는 목록에서 제외하지 않음).
 * - null(천문 실패 등 판정 없음) → 강조 없음.
 *
 * @param verdict U3 추천 판정 또는 null.
 */
export function toRecommendationView(verdict: Recommendation | null): RecommendationView {
  if (verdict !== null && verdict.verdict === 'recommended') {
    return { yellowBorder: true, starIcon: true, label: RECOMMENDED_LABEL };
  }
  return NO_EMPHASIS;
}
