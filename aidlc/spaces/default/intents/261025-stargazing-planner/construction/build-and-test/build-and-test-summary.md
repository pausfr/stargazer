# Build and Test Summary — stargazing-planner

> Test Strategy: **Standard**. 4개 단위(u1-astronomy, u2-weather-data,
> u3-domain-rules, u4-web-ui) 전체 번들의 빌드·테스트 종합. 무료 정적 웹 앱.

## 빌드 상태·사전 요구

- 타입 검사 `npx tsc --noEmit`: 통과(exit 0).
- 정적 번들 `npx vite build`: 통과(43 모듈, `dist-web/` 산출).
- 의존성 핀 유지(vitest 2.1.9/coverage 2.1.9/vite 5.4.11/chart.js 4.4.7/
  annotation 3.1.0/zoom/happy-dom 15.11.7/eslint 9.17.0). 비밀값 없음(NFR6.1).

## 테스트 유형 인벤토리(생성한 것)

- 빌드 지침(`build-instructions.md`).
- 통합 테스트 지침(`integration-test-instructions.md`) — Standard 전략.
- 성능/보안 전용 지침 파일은 생성하지 않음(Comprehensive 전용). 해당 NFR은
  아래 매트릭스에 소유 단계·검증 방식과 함께 기록.
- 단위 테스트는 각 단위 Code Generation이 소유(아래 결과 참조).

## 단위별 커버리지 기대

| 단위 | kind | 80% 라인 플로어 | 실측 |
|------|------|-----------------|------|
| u1-astronomy | library | 대상 | 92.83% (astronomy.ts 95.2%) |
| u2-weather-data | library | 대상 | 통과(33 tests) |
| u3-domain-rules | library | 대상 | 통과(31 tests) |
| u4-web-ui | ui | **비대상**(team.md Q4) | 순수 로직 집중(72 tests), 렌더 수동 스모크 |

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| COV-U1 | team.md Q4 / org Testing Posture | u1 라인 ≥ 80% | 92.83% | `npx vitest run src/astronomy/__tests__ --coverage.include='src/astronomy/**'` | build-and-test | Met |
| COV-U2 | team.md Q4 | u2 라인 ≥ 80%(핵심 모듈) | 통과(33 tests green) | `npx vitest run src/weather` | build-and-test | Met |
| COV-U3 | team.md Q4 | u3 라인 ≥ 80%(핵심 모듈) | 통과(31 tests green) | `npx vitest run src/domain-rules` | build-and-test | Met |
| TYPECHECK | package.json `build` | tsc 오류 0 | exit 0 | `npx tsc --noEmit` | build-and-test | Met |
| BUILD-WEB | package.json `build:web` | 정적 번들 산출 | 43 모듈, dist-web/ 산출 | `npx vite build` | build-and-test | Met |
| SUITE | org Testing Posture / 검증 명령 | 전체 스위트 green | 167/167 passed | `npx vitest run --coverage` (exit 0) | build-and-test | Met |
| CI-EXEC | org/team "Run tests in CI before merge" | 머지 전 CI 실행 | — | ci-pipeline | N/A |
| NFR1 | requirements.md NFR1(다크모드·접근성) | 색 비의존 강조·대비 | 코드 반영(색+아이콘+라벨), 대비 | build-and-test(코드)/수동 스모크 | Met |
| NFR2 | requirements.md NFR2(모바일 우선) | 모바일 세로·데스크톱 비파괴 | styles.css 반응형·뷰포트 | build-and-test(코드)/수동 스모크 | Met |
| NFR3 | requirements.md NFR3(체감 로딩) | 정량 ms 목표 없음(정책) | 구조 코드 반영(스켈레톤·Promise.all·점진·공유 캐시) | code-summary / 수동 스모크 | performance-validation | N/A |
| NFR6.1 | requirements.md NFR6.1(비밀값) | 번들에 시크릿 없음 | 키 불필요 공개 API, env 없음 | build-and-test | Met |
| NFR6.2 | requirements.md NFR6.2(안전 렌더) | innerHTML 미사용, textContent | 전 뷰 textContent 바인딩 | build-and-test | Met |

- CI-EXEC: 이 플로에 ci-pipeline이 아직 앞에 있어(`[ ]`) 머지 전 CI 실행은
  CI Pipeline 단계가 맡는다. 여기서는 N/A(사유: CI Pipeline, later in this plan).
- NFR3: 팀이 정량 ms 목표를 두지 않기로 한 정책 NFR이라 Build and Test가 실행해
  측정할 "적용 가능한 측정 목표"가 아니다 → 여기서는 N/A(구조는 코드에 반영).
  부하·성능의 향후 정량 검증은 performance-validation 단계가 소유한다.

## 준비도 평가

- **build-ready**: 예(tsc·vite build·전체 스위트 green).
- **test-ready**: 예(단위·통합 테스트 통과, 핵심 모듈 커버리지 플로어 충족).
- **deployment-ready**: CI Pipeline(머지 전 CI 실행)과 배포 단계가 뒤따름.
  정적 번들 산출물은 준비됨.

## 알려진 제한·미결

- NFR3 성능의 향후 정량 검증은 performance-validation 단계 소관(여기선 정량 목표 없음 N/A, 구조는 코드 반영).
- 실제 화면 렌더링·Chart.js 그리기·반응형·다크 대비·한글 글리프는 수동 스모크로 보완(UI 단위는 자동 렌더 테스트 비대상, team.md).
- 머지 전 CI 실행(CI-EXEC)은 CI Pipeline 단계가 설정·소유(현재 N/A).
