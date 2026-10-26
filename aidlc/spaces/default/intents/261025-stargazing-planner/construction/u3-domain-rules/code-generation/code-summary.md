# Code Summary — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library): 달력 산출 + 추천 판정 순수 규칙 라이브러리. 승인된 code-generation-plan.md 14단계를 test-after로 구현.

## 생성/수정 파일

### 생성 (워크스페이스 루트 `src/domain-rules/`)
- `types.ts` — DateRange, CalendarDate(holidayCoverage·holidayGroupId 포함), HolidayCoverage, Recommendation, RecommendationVerdict. C1(AstronomyResult)·C2(CloudForecast)를 `../astronomy/index.js`·`../weather/index.js`에서 import·재노출.
- `constants.ts` — MOON_ILLUMINATION_MAX_PCT=20, CLOUD_MAX_PCT=30, HOLIDAY_TABLE_FROM_YEAR=2024·TO_YEAR=2027, NIGHT_CLOUD_AGGREGATION='average'. 계산과 분리(SD3).
- `holidays.ts` — 2024~2027 한국 법정공휴일+대체공휴일 내장 테이블. isHoliday/holidayName/holidayCoverageFor/isYearCovered. 범위 밖 연도는 outOfTable(주말만). 네트워크 없음.
- `calendar.ts` — WF1 listCandidateDates: 범위 전개 → 주말/공휴일 분류 → 후보 선별(공휴일 없으면 주말만) → KST 밤 범위(18:00~익일 06:00) → 연속 연휴 묶음(holidayGroupId·라벨). 입력 검증 게이트(fromKstId 실재성, months<3→3 보정)는 예외 없이 안전 기본값(SD1).
- `recommend.ts` — WF2 recommend: 분기 우선순위 보존(unknown→deferred 먼저, 그다음 조도 보정). outOfHorizon→조도만, known→밤 구간 구름 평균 집계(데이터 없으면 deferred), 조도≤20 AND 구름≤30이면 recommended. 조도 [0,100] 방어 클램프. verdictSortKey(WF3) 포함. 예외 없음.
- `index.ts` — 공개 API 배럴(listCandidateDates, recommend, verdictSortKey, 공개 타입·상수 재노출).

### 테스트 (`src/domain-rules/__tests__/`)
- `domain-rules.test.ts` — Vitest 단위 테스트 31개.

### 재사용 (U1·U2에서 생성, 신규 의존성 없음)
- 루트 package.json·tsconfig·vitest.config·.prettierrc·eslint. 날짜 연산은 내장 Date.

## 핵심 구현 결정
- **분기 우선순위 보존(SD1, BR2.4)**: recommend에서 cloud.status 분기를 먼저(unknown→deferred, outOfHorizon→조도만), 그다음 조도 보정. 비정상 조도 + unknown이어도 deferred 유지(not_recommended로 조용히 뒤집히지 않음).
- **밤 구간 구름 집계(BR2.6)**: fullDark 창이 있으면 그 창 안 시각의 평균, 없거나 모두 창 밖이면 제공된 전체 시각 평균(보수적 폴백). 평균 기준 경계 30% = recommended 쪽.
- **공휴일 내장 테이블(BR1.5)**: 2026~2028 커버(현재 연도부터 앞으로만 — 앱이 미래 연휴만 보여주므로 과거 연도는 수록하지 않음). 범위 밖 연도는 outOfTable로 공휴일 없이 주말만. 매년 갱신 대상.
- **연휴 묶음(BR1.4)**: epoch-day 연속성으로 holidayGroupId 부여, 라벨은 그룹 내 첫 공휴일명(없으면 '주말').
- **입력 검증(SD1)**: 예외 없이 빈 목록 또는 months 보정.
- **순수성(SD2)**: 네트워크·전역 상태 없음. 시각·입력 주입으로 결정성.
- **어댑터 경계(BR2.2)**: C1·C2 타입만 import, 외부 원형 타입 비참조.

## 테스트 커버리지 요약
- 31개 테스트 전부 통과. 전체 스위트 85개 통과(U1 22 + U2 32 + U3 31), U1·U2 회귀 없음.
- `src/domain-rules` 라인 커버리지 **97.38%**(80% 핵심 모듈 플로어 충족). holidays/constants 100%, calendar 96.52%, recommend 96.15%, index.ts는 재노출 배럴(0%).
- `npx tsc --noEmit` 통과(strict). `npx eslint src/domain-rules` 0 errors/warnings.

## 리뷰 iter1 반영(READY, Major 1 + Minor 2)
- Major: 2026 추석(9/26 토 겹침) 대체공휴일 9/28(월) 누락 수정 — 광복절·개천절의 토·일 겹침 대체 규칙과 일관되게 추가, 전용 테스트로 고정. 2024·2025·2027 추석·설날의 토·일 겹침 대체 규칙 적용 여부도 재확인(각각 이미 정합: 주중 연휴이거나 대체공휴일 기수록).
- Minor #1: recommend에서 C2 enum 밖 status를 예외 없이 명시적 deferred(reason='cloud status unknown')로 분기(의도 명시), 전용 테스트 추가.
- Minor #2: index.ts 배럴 0% 커버리지는 수용(실행 로직 없음), 사유 기록으로 충분.

## 이 단계에서 실행되지 않은 테스트
- 없음. 모든 단위 테스트가 이 단계에서 실행·통과. CI 실행은 CI Pipeline 단계에서 수행 예정.

## 계획과의 편차
1. plan_profile의 "API/endpoint"·"Frontend behavior" 레이어는 순수 라이브러리 U3에 해당 없어 생략(계획 §방법론 적용 매핑대로). 기능 축소 아님.
2. index.ts 배럴 커버리지 0%는 실행 로직 부재 때문(U1·U2 index와 동일 성격), 단위 전체 플로어는 충족.
