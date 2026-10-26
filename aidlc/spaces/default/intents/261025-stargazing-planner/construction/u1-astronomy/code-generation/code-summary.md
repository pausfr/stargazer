# Code Summary — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 승인된 code-generation-plan.md 6개 스텝 완료. test-after·standard, 핵심 계산 모듈 ~80% 커버리지.

## 생성/수정 파일

**프로젝트 골격·설정(전체 번들 공용 최소본)**
- `package.json` — TypeScript, Vitest, @vitest/coverage-v8, ESLint, Prettier, 그리고 천문 라이브러리 `astronomy-engine@2.1.19`(순수 JS/TS, 무의존·무키, MIT)
- `tsconfig.json` — strict
- `.prettierrc.json`, `eslint.config.js` — team.md Code Style(Prettier + ESLint, camelCase)
- `vitest.config.ts` — v8 커버리지 리포터

**u1 소스(`src/astronomy/`)**
- `types.ts` — `AstronomyInput`, `AstronomyResult`, `TwilightWindow`(start/end nullable), `AstronomyComputationError` (entities.md, C1 갱신 반영)
- `validation.ts` — SD1 입력 검증 게이트, 실패 시 `AstronomyComputationError` (BR5.1)
- `night-range.ts` — "그날 밤" 범위 해석, 기본 18:00~익일 06:00 (BR3.2)
- `astronomy.ts` — `computeAstronomy()` 유일 public 진입점: 달 조도(BR1.1)·박명 3종(BR2.1)·완전한 밤(BR2.2)·월출/월몰 범위 판정(BR3.1), UTC 계산→KST ISO 출력(BR4.2), 경계 반올림(BR4.1)
- `index.ts` — `computeAstronomy` + public 타입만 export(내부 함수·라이브러리 접근 캡슐화)
- `__tests__/astronomy.test.ts` — Vitest 단위 테스트 22개

## 핵심 구현 결정

- 천문 라이브러리: `astronomy-engine`(tech-stack-decisions 1순위). 무료·키 불필요·브라우저 동작으로 NFR5·NFR6 충족. 라이브러리 원시 기능(태양/달 고도 탐색, rise/set 탐색)으로 박명·완전한 밤·월출/월몰 도출.
- `computeAstronomy`를 유일 진입점으로 두고 내부 계산 함수와 라이브러리 접근을 캡슐화(logical-components).
- 실패는 조용히 삼키지 않고 `AstronomyComputationError`로 표면화(구성 가드레일·BR5.1).

## 테스트 커버리지 요약

- 명령: `npx vitest run src/astronomy/__tests__ --coverage.enabled --coverage.include='src/astronomy/**'` (u1 전용 스코프)
- 결과: **22 passed / 0 failed**
- 라인 커버리지: 전체 89.8% — astronomy.ts 92%, night-range.ts 93.33%, validation.ts 86.66%. 핵심 계산 3개 모듈 모두 ~80% 플로어 충족. types.ts(타입 전용)·index.ts(배럴) 제외.
- `tsc --noEmit` 통과, Prettier 포맷 적용.
- 라이브러리 모킹 없음. 기준값 교차 확인: 신월 2026-11-09≈0%, 보름 2026-11-24≈99.7%, 중간 2026-11-17≈49%, Tromsø 백야로 완전한 밤 null 쌍.

## 이 단계에서 실행하지 않은 테스트

- 없음. u1의 모든 단위 테스트가 이 단계에서 실행되어 통과했다(순수 로컬 계산이라 외부 런타임 불필요).

## 계획 대비 편차

- 구현 로직 편차 없음.
- Step 4에서 "월출/월몰 범위 밖→null" 테스트의 초기 1분 창(23:55~00:05)에 실제 월몰(00:01 KST)이 포함되어 실패했는데, 이는 구현이 BR3.1대로 올바르게 동작한 것이므로 **테스트 데이터를 실제 월출/월몰이 없는 창으로 보정**(구현 변경 아님). 최종 전부 통과.
