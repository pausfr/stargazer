/**
 * 구름 요약의 순수 표시 매핑 (functional-spec §3 CloudSummary).
 *
 * known 상태의 시간별 구름량을 사용자용 대표값(평균 %)으로 요약한다. 판정
 * 로직이 아니라 표시 요약이며(U3가 추천 판정 소유), unknown/outOfHorizon은
 * 평균 대상이 아니므로 null을 돌려준다(호출부가 중립 안내로 대체).
 */

import type { CloudForecast } from './types.js';

/**
 * known 예보의 시간별 구름량 평균(반올림 %)을 돌려준다. 데이터가 없거나
 * known이 아니면 null. 내부 reason은 읽지 않는다(SD3).
 *
 * @param cloud 구름 예보 결과.
 */
export function averageCloudPct(cloud: CloudForecast): number | null {
  if (cloud.status !== 'known' || cloud.hourlyCloudPct === null) {
    return null;
  }
  const valid = cloud.hourlyCloudPct.filter(
    (h) => typeof h.cloudPct === 'number' && !Number.isNaN(h.cloudPct),
  );
  if (valid.length === 0) {
    return null;
  }
  const sum = valid.reduce((acc, h) => acc + h.cloudPct, 0);
  return Math.round(sum / valid.length);
}
