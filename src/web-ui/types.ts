/**
 * u4-web-ui 표시 전용 뷰모델 타입 (functional-spec §2·§2.1).
 *
 * U4는 소유 엔티티가 없다. 상위 계약 타입(C1 AstronomyResult·C2
 * CloudForecast·C3 CalendarDate/Recommendation)은 각 단위의 공개 index에서
 * import하며 여기서 재구현하지 않는다. NightView는 한 밤(dateKstId)의
 * 표시 단위를 UI 내부에서 조립한 결과이며 영속되지 않는다.
 */

import type { AstronomyResult } from '../astronomy/index.js';
import type { CloudForecast } from '../weather/index.js';
import type { CalendarDate, Recommendation } from '../domain-rules/index.js';

export type { AstronomyResult } from '../astronomy/index.js';
export type { CloudForecast, CloudStatus } from '../weather/index.js';
export type { CalendarDate, Recommendation } from '../domain-rules/index.js';

/**
 * 화면/카드 단위 표시 상태(functional-spec §5).
 * - loading: 조립 전.
 * - ok:      천문 OK + 날씨 known 또는 outOfHorizon.
 * - partial: 천문 OK + 날씨 unknown(구름만 "알 수 없음").
 * - error:   천문 실패(핵심이므로 전체 차단).
 */
export type ViewState = 'loading' | 'ok' | 'partial' | 'error';

/**
 * 한 밤(dateKstId)의 표시 조립 결과(표시 전용, 영속 아님).
 *
 * astro가 실패하면 astro=null·astroError=true가 되고 state=error가 된다.
 * verdict는 목록 카드 강조에 쓰이며 상세에서는 불필요할 수 있어 nullable.
 */
export interface NightView {
  /** 식별자 KST 날짜 키 YYYY-MM-DD. */
  dateKstId: string;
  /** U3 listCandidateDates 결과의 한 항목. */
  calendar: CalendarDate;
  /** U1 computeAstronomy 결과. 실패 시 null(astroError=true). */
  astro: AstronomyResult | null;
  /** AstronomyComputationError 발생 여부(천문 실패 → error). */
  astroError: boolean;
  /** U2 getCloudForecast 결과(status로 known/outOfHorizon/unknown). */
  cloud: CloudForecast;
  /** U3 recommend 결과. 천문 실패 시 null. */
  verdict: Recommendation | null;
  /** 파생 표시 상태(functional-spec §5). */
  state: ViewState;
}

/**
 * 전국 대표 좌표 1개(서울). U1/U2 호출 입력에 전달한다(functional-spec §1).
 * MVP는 지역 구획 없이 이 단일 좌표로 계산한다(project.md 학습).
 */
export const DEFAULT_LOCATION = { lat: 37.5665, lon: 126.978 } as const;
