/**
 * 상세 화면 핵심 숫자 요약의 순수 표시 매핑 (functional-spec §4, AC3.2.1·AC3.2.3).
 *
 * 월출·월몰·완전한 밤 경계가 null이면 각각 "없음"으로 **명시 표시**한다
 * (생략하지 않음, AC3.2.3 확정). KST ISO 시각은 읽기 쉬운 HH:MM 표기로
 * 변환한다. 순수 함수이므로 단위 테스트 대상(Chart.js 그리기는 제외).
 */

import type { AstronomyResult } from './types.js';

/**
 * "없음" 표기 상수(월출/월몰/완전한 밤 미성립 시).
 *
 * 값에는 라벨을 반복하지 않는다 — detailView.renderSummary가 라벨
 * ("월출"/"월몰"/"완전한 밤")을 별도 span으로 렌더하므로, 값은 "없음"만 둔다
 * (라벨 "월몰" + 값 "없음" → "월몰 없음"; 종전 "월몰 월몰 없음" 중복 제거, 3번).
 * AC3.2.3: null 경계는 생략하지 않고 "없음"으로 **명시 표시**한다.
 */
export const MOONRISE_NONE_TEXT = '-';
export const MOONSET_NONE_TEXT = '-';
export const FULLDARK_NONE_TEXT = '-';

/** 상세 요약 표시용 값 묶음. */
export interface NightSummaryView {
  /** 완전한 밤 시작 표기(HH:MM 또는 "없음"). */
  fullDarkStartText: string;
  /** 완전한 밤 끝 표기(HH:MM 또는 "없음"). */
  fullDarkEndText: string;
  /** 완전한 밤 경계가 성립하는지(둘 다 non-null). */
  hasFullDark: boolean;
  /** 월출 표기(HH:MM 또는 "없음"). */
  moonriseText: string;
  /** 월몰 표기(HH:MM 또는 "없음"). */
  moonsetText: string;
  /** 달 조도 표기(예: "42%"). */
  moonIlluminationText: string;
}

/**
 * KST ISO 시각 문자열에서 HH:MM을 뽑는다. 파싱 불가하면 원본을 그대로 둔다.
 *
 * ISO 로컬 표기(YYYY-MM-DDTHH:MM...)의 시/분을 직접 읽어 타임존 변환 없이
 * KST 벽시계 시각을 보존한다(상위 계약이 KST ISO로 제공, BR4.2).
 */
export function formatKstTime(iso: string): string {
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (m === null) {
    return iso;
  }
  return `${m[1]}:${m[2]}`;
}

/**
 * 천문 결과로부터 상세 요약 표시 값을 매핑한다(AC3.2.1·AC3.2.3).
 *
 * null 경계는 생략하지 않고 "없음" 문구로 명시 표시한다.
 *
 * @param astro 천문 계산 결과.
 */
export function toNightSummaryView(astro: AstronomyResult): NightSummaryView {
  const hasFullDark = astro.fullDarkStart !== null && astro.fullDarkEnd !== null;
  return {
    hasFullDark,
    fullDarkStartText:
      astro.fullDarkStart !== null ? formatKstTime(astro.fullDarkStart) : FULLDARK_NONE_TEXT,
    fullDarkEndText:
      astro.fullDarkEnd !== null ? formatKstTime(astro.fullDarkEnd) : FULLDARK_NONE_TEXT,
    moonriseText: astro.moonrise !== null ? formatKstTime(astro.moonrise) : MOONRISE_NONE_TEXT,
    moonsetText: astro.moonset !== null ? formatKstTime(astro.moonset) : MOONSET_NONE_TEXT,
    moonIlluminationText: `${Math.round(astro.moonIlluminationPct)}%`,
  };
}
