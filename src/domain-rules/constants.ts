/**
 * 정책성 상수 (SD3, ADR-002).
 *
 * 추천 임계값·공휴일 테이블 커버 연도 범위·밤 구간 구름 집계 방식을
 * 계산 로직과 분리해 한 곳에 모은다(BR2.5, NFR-U3-MAINT.1). 임계값을
 * 여러 곳에 흩뿌리지 않는다.
 */

/** 추천 상한: 달 조도(%). 이 값 이하(<=)이면 '어두운 밤' 조건 충족(BR2.5). */
export const MOON_ILLUMINATION_MAX_PCT = 20;

/** 추천 상한: 밤 구간 구름량(%). 이 값 이하(<=)이면 '맑은 밤' 조건 충족(BR2.5). */
export const CLOUD_MAX_PCT = 30;

/**
 * 내장 공휴일 테이블 커버 연도 범위(포함). 범위 밖 연도는 outOfTable로
 * 공휴일 없이 주말만 판정한다(BR1.5). 앱은 미래 연휴만 보여주므로(FR1.1)
 * 현재 연도부터 앞으로만 담으며 과거 연도는 수록하지 않는다. 매년 갱신 대상.
 */
export const HOLIDAY_TABLE_FROM_YEAR = 2026;
export const HOLIDAY_TABLE_TO_YEAR = 2028;

/**
 * 밤 구간 구름량 집계 방식(BR2.6). 밤 범위에 속하는 시간별 구름량의
 * 산술 평균을 대표값으로 쓴다. 평균은 경계(정확히 30%)가 recommended
 * 쪽(<=)임을 보존한다.
 */
export const NIGHT_CLOUD_AGGREGATION = 'average' as const;
