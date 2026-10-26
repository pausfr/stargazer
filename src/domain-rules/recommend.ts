/**
 * 추천 판정 — 밤 단위 3-상태 (WF2, BR2.1~BR2.6, SD1·SD2).
 *
 * recommend(astro, cloud)가 유일한 공개 진입점이다(C3). 순수·결정적이며
 * 예외를 던지지 않는다. 분기 우선순위(SD1, BR2.4 보존): cloud.status
 * 분기를 먼저 적용하고(unknown→deferred, outOfHorizon→조도만), 그
 * 다음에만 조도 비정상 보정을 한다. 즉 unknown이면 조도 비정상 여부와
 * 무관하게 deferred를 유지해, deferred가 not_recommended로 조용히
 * 뒤집히지 않게 한다.
 */

import { CLOUD_MAX_PCT, MOON_ILLUMINATION_MAX_PCT } from './constants.js';
import type { AstronomyResult, CloudForecast, Recommendation } from './types.js';

/** 조도를 [0, 100]로 방어적으로 클램프한다(상류 신뢰하되 보수적, SD1). */
function clampIllumination(pct: number): number {
  if (typeof pct !== 'number' || Number.isNaN(pct)) {
    return 100; // 알 수 없으면 '밝음'으로 보수 처리(추천 쪽으로 기울지 않게).
  }
  if (pct < 0) {
    return 0;
  }
  if (pct > 100) {
    return 100;
  }
  return pct;
}

/**
 * 밤 범위(nightStart~nightEnd)에 속하는 시간별 구름량을 평균으로 집계한다(BR2.6).
 *
 * 범위 경계는 ISO 시각 비교로 판정한다. 범위에 속하는 데이터가 하나도
 * 없으면 null(호출부가 deferred로 처리).
 */
function aggregateNightCloudPct(cloud: CloudForecast, astro: AstronomyResult): number | null {
  const hourly = cloud.hourlyCloudPct;
  if (hourly === null || hourly.length === 0) {
    return null;
  }

  const startMs = Date.parse(astro.fullDarkStart ?? '');
  const endMs = Date.parse(astro.fullDarkEnd ?? '');
  const hasNightWindow = !Number.isNaN(startMs) && !Number.isNaN(endMs) && startMs < endMs;

  // "그날 밤" 창이 성립하면 그 창 안의 시각만, 아니면 제공된 전체 시각을
  // 대상으로 평균한다(BR2.6: 밤 구간 집계, 창 미성립 시 보수적 전체 평균).
  const inWindow = hasNightWindow
    ? hourly.filter((h) => {
        const t = Date.parse(h.hourKst);
        return !Number.isNaN(t) && t >= startMs && t <= endMs;
      })
    : hourly;

  const samples = inWindow.length > 0 ? inWindow : hourly;
  const valid = samples.filter((h) => typeof h.cloudPct === 'number' && !Number.isNaN(h.cloudPct));
  if (valid.length === 0) {
    return null;
  }

  const sum = valid.reduce((acc, h) => acc + h.cloudPct, 0);
  return sum / valid.length;
}

function recommendation(
  dateKstId: string,
  verdict: Recommendation['verdict'],
  moonIlluminationPct: number,
  cloudConsidered: boolean,
  reason: string | null = null,
): Recommendation {
  return { dateKstId, verdict, reason, moonIlluminationPct, cloudConsidered };
}

/**
 * WF2: 한 밤의 추천 판정을 3-상태로 산출한다(C3).
 *
 * 분기 우선순위(SD1, BR2.4 보존):
 * 1. cloud.status=unknown → deferred(reason='cloud unknown', 조도는 표시용
 *    전달, 추천 점수 산출 안 함). 조도 비정상이어도 deferred 유지(BR2.4).
 * 2. cloud.status=outOfHorizon → 구름 미적용(cloudConsidered=false). 조도만
 *    판정: 조도 <= 20%면 recommended, 아니면 not_recommended(BR2.3).
 * 3. cloud.status=known → 밤 구간 구름량 집계(평균, BR2.6). 밤 구간 데이터
 *    전무면 deferred(BR2.4). 있으면 조도 <= 20% AND 구름 <= 30%면
 *    recommended, 아니면 not_recommended(BR2.1·BR2.2·BR2.5).
 *
 * 예외 없음. 입력은 상류 계약을 신뢰하되 조도는 방어적으로 클램프한다(SD1).
 *
 * @param astro 천문 계산 결과(달 조도·밤 창).
 * @param cloud 구름 예보 결과(3-상태).
 * @returns 밤 단위 Recommendation.
 */
export function recommend(astro: AstronomyResult, cloud: CloudForecast): Recommendation {
  const dateKstId = astro.dateKstId;
  const illumination = clampIllumination(astro.moonIlluminationPct);

  // 1. unknown 우선(BR2.4): 조도 비정상 여부와 무관하게 deferred 유지.
  if (cloud.status === 'unknown') {
    return recommendation(dateKstId, 'deferred', illumination, false, 'cloud unknown');
  }

  // 2. outOfHorizon: 조도만으로 판정(구름 미적용, BR2.3).
  if (cloud.status === 'outOfHorizon') {
    const verdict = illumination <= MOON_ILLUMINATION_MAX_PCT ? 'recommended' : 'not_recommended';
    return recommendation(dateKstId, verdict, illumination, false);
  }

  // 3. known: 밤 구간 구름량 집계(BR2.6).
  if (cloud.status !== 'known') {
    // C2 enum 밖의 예상치 못한 status는 보수적으로 보류(예외 없이, SD1).
    return recommendation(dateKstId, 'deferred', illumination, false, 'cloud status unknown');
  }
  const nightCloudPct = aggregateNightCloudPct(cloud, astro);
  if (nightCloudPct === null) {
    // 밤 구간 구름 데이터 전무 → deferred(BR2.4).
    return recommendation(dateKstId, 'deferred', illumination, false, 'no night cloud data');
  }

  const isDark = illumination <= MOON_ILLUMINATION_MAX_PCT;
  const isClear = nightCloudPct <= CLOUD_MAX_PCT;
  const verdict = isDark && isClear ? 'recommended' : 'not_recommended';
  return recommendation(dateKstId, verdict, illumination, true);
}

/**
 * 정렬 키(WF3, Q4): recommended(0) → not_recommended(1) → deferred(2).
 * deferred를 목록에서 제외하지 않고 뒤로 둔다(BR2.4). 렌더링·정렬은
 * 호출부(U4)가 수행할 수 있다.
 */
export function verdictSortKey(verdict: Recommendation['verdict']): number {
  switch (verdict) {
    case 'recommended':
      return 0;
    case 'not_recommended':
      return 1;
    case 'deferred':
      return 2;
    default:
      return 3;
  }
}
