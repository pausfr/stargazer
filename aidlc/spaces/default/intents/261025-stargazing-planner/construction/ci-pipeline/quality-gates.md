# Quality Gates — stargazing-planner (CI)

> 머지/배포 전에 강제하는 품질 게이트. 하나라도 실패하면 머지·배포를 차단한다
> (bypass는 사고, 지름길 아님). 근거: ci-pipeline-questions.md Q3, Build and Test
> 검증 명령·커버리지 플로어, team.md Testing Posture·Code Style.

## 게이트 목록(머지/배포 전, 전부 통과 필수)

| # | 게이트 | 명령 | 통과 기준 | 실패 시 |
|---|--------|------|-----------|---------|
| G1 | 타입 검사 | `npx tsc --noEmit` | 타입 오류 0(exit 0) | 머지/배포 차단 |
| G2 | 린트 | `npx eslint .` | 오류 0 | 차단 |
| G3 | 포맷 | `npx prettier --check .` | 포맷 위반 0 | 차단 |
| G4 | 전체 테스트 | `npx vitest run --coverage` | 전부 green(현재 167개) | 차단 |
| G5 | u1 커버리지 플로어 | `npx vitest run src/astronomy --coverage --coverage.include='src/astronomy/**'` | 라인 ≥ 80%(현재 92.83%) | 차단 |
| G6 | u2 커버리지 플로어 | `npx vitest run src/weather --coverage --coverage.include='src/weather/**'` | 라인 ≥ 80% | 차단 |
| G7 | u3 커버리지 플로어 | `npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'` | 라인 ≥ 80% | 차단 |
| G8 | 정적 번들 빌드 | `npx vite build` | `dist-web/` 산출, exit 0 | 차단 |

## 커버리지 플로어 방침(team.md Q4)

- 80% 라인 커버리지 플로어는 **핵심 계산 모듈(u1/u2/u3)에만** 적용한다.
- **u4(UI)는 플로어 비대상** — 순수 로직은 테스트하고 실제 렌더링은 수동 스모크.
- 측정은 경로 한정(`--coverage.include='src/<unit>/**'`)으로 한다(루트 집계가
  `.kiro` 툴링 등 리포지토리 전체를 포함해 플로어를 희석하는 문제 회피).
- 플로어·테스트 설정은 게이트를 통과시키려고 낮추지 않는다(Build and Test·org 규칙).

## 배포 게이트

- **머지 시 배포**(team.md Deployment): `main`에 머지되면 G1~G8 통과 후 자동 배포.
- 1인 개인 앱·무료 정적 호스팅이라 **별도의 수동 프로덕션 승인 게이트는 두지 않는다**
  (team.md 확정). 롤백은 정적 호스팅 제공자의 이전 배포로 되돌리거나 `main` 직전
  커밋으로 재배포.

## 보안 게이트

- 번들에 비밀값·API 키 없음(NFR6.1, project.md Forbidden) — 키 없는 공개 API 사용.
  시크릿 스캔은 선택(별도 시크릿을 두지 않으므로 표면이 거의 없음).

## Sources

- ci-pipeline-questions.md Q3(품질 게이트 확정).
- build-and-test-summary.md·test-results.md(검증 명령·커버리지 실측).
- team.md Testing Posture(플로어·측정 방식)·Code Style(ESLint/Prettier)·Deployment(머지 시 배포·수동 승인 없음).
- project.md Forbidden(비밀값 하드코딩 금지).

## Assumptions & Open Questions

None.
