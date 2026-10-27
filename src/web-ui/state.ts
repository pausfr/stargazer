/**
 * 화면/카드 상태 매핑 (functional-spec §5, FR6.1~6.3, SD3).
 *
 * 순수 함수. 천문/구름 결과로부터 표시 상태(ViewState)와 중립 문구를
 * 산출한다. 내부 사유(CloudForecast.reason, AstronomyComputationError.code)는
 * 절대 UI 문구로 노출하지 않는다(SD3/FR6.3). 색이 아니라 텍스트로 상태를
 * 구분하도록 문구를 제공한다(NFR1).
 */

import type { AstronomyResult, CloudForecast, ViewState } from './types.js';

/** 구름 상태별 중립 안내 문구(내부 사유 비노출). */
export const CLOUD_UNKNOWN_TEXT = '구름량 알 수 없음';
export const CLOUD_FAR_DATE_TEXT = '날씨는 날짜가 가까워지면 표시돼요';

/**
 * 천문/구름 결과로부터 표시 상태를 파생한다(functional-spec §5).
 *
 * - astro가 null(천문 실패) → 'error'(핵심, FR6.2).
 * - cloud.status==='unknown' → 'partial'(구름만 알 수 없음, FR6.1).
 * - cloud.status==='known' | 'outOfHorizon' → 'ok'.
 *
 * 입력 astro가 null이면 cloud 상태와 무관하게 error가 우선한다.
 *
 * @param astro 천문 계산 결과 또는 null(실패).
 * @param cloud 구름 예보 결과(3-상태).
 */
export function mapState(astro: AstronomyResult | null, cloud: CloudForecast): ViewState {
  if (astro === null) {
    return 'error';
  }
  if (cloud.status === 'unknown') {
    return 'partial';
  }
  // known | outOfHorizon
  return 'ok';
}

/**
 * 구름 상태에 대응하는 사용자 표시 문구를 돌려준다(SD3, 중립·내부 사유 비노출).
 *
 * - known       → null(요약은 호출부가 hourlyCloudPct로 생성).
 * - outOfHorizon → "날짜가 가까워지면" 안내.
 * - unknown      → "구름량 알 수 없음"(실패를 비난하지 않는 중립 문구).
 *   이때 cloud.reason(내부 사유)은 읽지도 노출하지도 않는다.
 */
export function cloudStatusText(cloud: CloudForecast): string | null {
  switch (cloud.status) {
    case 'outOfHorizon':
      return CLOUD_FAR_DATE_TEXT;
    case 'unknown':
      return CLOUD_UNKNOWN_TEXT;
    case 'known':
    default:
      return null;
  }
}
