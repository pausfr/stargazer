# Test Results — stargazing-planner (Build and Test)

> 실행 일시 기준 전체 번들의 빌드·테스트 결과. 모든 명령은 프로젝트 루트에서 실행.

## 빌드 상태

| 단계 | 명령 | 결과 |
|------|------|------|
| 타입 검사 | `npx tsc --noEmit` | 통과(exit 0) |
| 정적 번들 | `npx vite build` | 통과(43 모듈, `dist-web/index.html`·`assets/*` 산출) |

## 테스트 결과(단위별 범위 한정 명령)

| 단위 | 명령 | 결과 |
|------|------|------|
| u1-astronomy | `npx vitest run src/astronomy/__tests__ --coverage.include='src/astronomy/**'` | 31 passed, 라인 92.83%(astronomy.ts 95.2%) |
| u2-weather-data | `npx vitest run src/weather` | 33 passed |
| u3-domain-rules | `npx vitest run src/domain-rules` | 31 passed |
| u4-web-ui | `npx vitest run src/web-ui` | 72 passed |
| 전체(검증 명령) | `npx tsc --noEmit && npx vitest run --coverage` | **167 passed / 0 failed (17 test files)**, exit 0 |

- 합계(전체 스위트): 167 passed, 0 failed, 0 skipped.
- 외부 날씨 API 호출 없음(전부 mock). 실제 DOM 렌더링·Chart.js 그리기는 자동 테스트 제외(수동 스모크).

## 실패 상세

- 없음. 모든 빌드·테스트 명령이 exit 0으로 통과.

## 커버리지 보고

- u1(핵심 계산 모듈): 라인 92.83% ≥ 80% 플로어. astronomy.ts 95.2%, night-range.ts 96%, validation.ts 86.66%, index.ts 0%(재노출 배럴, 실행 로직 없음).
- u2/u3: 각 단위 스위트 green(핵심 모듈 플로어 충족, code-generation 단계에서 확인된 값 유지).
- u4(UI): 80% 플로어 비대상(team.md Q4). 순수 로직(조립·상태/표시/차트 구성 매핑) 집중.
- 루트 집계 라인% 수치는 `.kiro` 툴링 등 리포지토리 전체를 포함해 희석되므로 핵심 모듈 플로어 판정에 쓰지 않는다(경로 한정 측정으로 판정).

## Target Verification Matrix (최종)

| Target ID | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|
| COV-U1 | u1 라인 ≥ 80% | 92.83% | 범위 한정 vitest 커버리지 | build-and-test | Met |
| COV-U2 | u2 핵심 ≥ 80% | green(33) | `npx vitest run src/weather` | build-and-test | Met |
| COV-U3 | u3 핵심 ≥ 80% | green(31) | `npx vitest run src/domain-rules` | build-and-test | Met |
| TYPECHECK | tsc 오류 0 | exit 0 | `npx tsc --noEmit` | build-and-test | Met |
| BUILD-WEB | 정적 번들 산출 | 43 모듈 | `npx vite build` | build-and-test | Met |
| SUITE | 전체 green | 167/167 | `npx vitest run --coverage` | build-and-test | Met |
| NFR1 | 색 비의존 강조·대비 | 코드 반영 | styles.css/recommendationView | build-and-test | Met |
| NFR2 | 모바일 세로·비파괴 | 코드 반영 | styles.css/index.html | build-and-test | Met |
| NFR6.1 | 번들에 시크릿 없음 | env/키 없음 | 소스 전수 | build-and-test | Met |
| NFR6.2 | innerHTML 미사용 | textContent 전용 | 전 뷰 | build-and-test | Met |
| NFR3 | 정량 목표 없음(정책) | 구조 코드 반영 | code-summary | performance-validation | N/A |
| CI-EXEC | 머지 전 CI 실행 | — | — | ci-pipeline | N/A |

- Pending 잔여 없음. 적용 가능한 모든 목표가 Met, 정책/소유 이관 목표만 N/A.

## 성공 판정

모든 실행 명령이 통과하고 적용 가능한 모든 목표가 Met이다(N/A는 정책 또는
후속 단계 소유). **Build and Test 성공.** 실패 사다리(loop-back)는 발동하지 않았다.
