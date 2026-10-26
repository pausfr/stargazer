/**
 * u3-domain-rules 공개 타입 (C3 계약 반영).
 *
 * 달력(주말·공휴일 연휴 날짜 산출)과 추천 판정(3-상태)을 담는 순수 규칙
 * 라이브러리의 값 객체들이다. 상류 계약 타입 AstronomyResult(C1)·
 * CloudForecast(C2)는 각각 U1(src/astronomy)·U2(src/weather)의 공개
 * index에서 import해 recommend 시그니처를 정합시킨다. 영속 상태 없음.
 */

import type { AstronomyResult } from '../astronomy/index.js';
import type { CloudForecast } from '../weather/index.js';

export type { AstronomyResult } from '../astronomy/index.js';
export type { CloudForecast } from '../weather/index.js';

/**
 * listCandidateDates 입력(C3). 시작일과 개월 수.
 *
 * 불변식(BR1.1): months >= 3. fromKstId는 KST 날짜 키 YYYY-MM-DD.
 */
export interface DateRange {
  /** KST 날짜 키 YYYY-MM-DD(조회 시작). */
  fromKstId: string;
  /** 조회 개월 수, 3 이상(FR1.1). */
  months: number;
}

/**
 * 날짜가 내장 공휴일 테이블의 커버 연도 범위 안/밖인지(BR1.5, Q1).
 *
 * - covered    → 테이블로 공휴일 판정(대체공휴일 포함).
 * - outOfTable → 공휴일 정보 없이 주말만으로 후보를 판정(범위 밖 연도).
 */
export type HolidayCoverage = 'covered' | 'outOfTable';

/**
 * 후보 날짜 한 밤. 주말 또는 공휴일 연휴에 속하는 "그날 밤"(FR1.4).
 * dateKstId로 식별한다.
 */
export interface CalendarDate {
  /** KST 날짜 키 YYYY-MM-DD(식별자). */
  dateKstId: string;
  /** 연휴/주말 이름(연휴 묶음 이름 또는 '주말'). */
  label: string;
  /** 내장 테이블 기준 공휴일 여부(outOfTable이면 항상 false, BR1.5). */
  isHoliday: boolean;
  /** 토·일 여부. */
  isWeekend: boolean;
  /** 이 날짜가 테이블 커버 연도 범위 안인지(BR1.5). */
  holidayCoverage: HolidayCoverage;
  /** 그날 밤 시작(KST 저녁, ISO 시각). FR1.4·BR1.3. */
  nightStartKst: string;
  /** 다음날 새벽(KST, ISO 시각). BR1.3. */
  nightEndKst: string;
  /** 연속 주말+공휴일 묶음 식별자. 같은 묶음의 밤들은 동일 값(BR1.4). */
  holidayGroupId?: string;
}

/** 추천 판정 3분류(C3, BR2.1~BR2.4). */
export type RecommendationVerdict = 'recommended' | 'not_recommended' | 'deferred';

/**
 * 한 밤의 추천 판정 결과(C3). AstronomyResult·CloudForecast를 입력으로
 * recommend가 산출한다.
 */
export interface Recommendation {
  /** 판정 대상 밤의 날짜 키(astro.dateKstId 반영). */
  dateKstId: string;
  /** 추천 판정(BR2.1~BR2.4). */
  verdict: RecommendationVerdict;
  /** verdict=deferred일 때 보류 사유(예: 'cloud unknown'). 그 외 null. */
  reason: string | null;
  /** 판정에 쓰인 달 조도(표시용으로 함께 전달), [0, 100]. */
  moonIlluminationPct: number;
  /** 구름 조건을 판정에 반영했는지(known=true, outOfHorizon/unknown=false). */
  cloudConsidered: boolean;
}

/** recommend 입력 묶음(가독성용 별칭). */
export interface RecommendInput {
  astro: AstronomyResult;
  cloud: CloudForecast;
}
