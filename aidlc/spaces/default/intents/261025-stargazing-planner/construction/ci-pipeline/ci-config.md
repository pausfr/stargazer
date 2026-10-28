# CI Pipeline Config — stargazing-planner

> CI 도구: **GitHub Actions**. 브랜치 전략: **트렁크 기반(단일 `main`)**.
> 무료 정적 웹 앱(Vite 번들) — 별도 아티팩트 저장소 없이 정적 번들을 호스팅에 배포.
> 근거: ci-pipeline-questions.md(Q1·Q2·Q3·Q4), team.md Way of Working·Deployment·
> Testing Posture·Code Style, build-and-test-summary.md(검증 명령·커버리지 플로어).

## 트리거

- `push`(브랜치 `main`): 품질 게이트 전체 실행 + 통과 시 GitHub Pages 배포.
- `pull_request`(대상 `main`): 품질 게이트 실행(배포는 하지 않음). 1인 트렁크
  기반이라 PR은 선택이지만, PR을 열면 머지 전 게이트가 돌도록 둔다.
- 수동 `workflow_dispatch`: 필요 시 수동 실행.

## 파이프라인 단계(Job: `build-and-check`)

러너: `ubuntu-latest`. Node 설치 후 다음을 순서대로 실행한다.

1. **의존성 설치** — `npm ci`(고정 `package-lock.json` 사용, 핀 유지).
2. **타입 검사** — `npx tsc --noEmit`.
3. **린트/포맷** — `npx eslint .` + `npx prettier --check .`(루트 설정 사용, team.md Code Style).
4. **테스트 + 커버리지** — `npx vitest run --coverage`(전체 스위트).
5. **핵심 모듈 커버리지 플로어** — 경로 한정 측정:
   - `npx vitest run src/astronomy --coverage --coverage.include='src/astronomy/**'`(≥80%)
   - `npx vitest run src/weather --coverage --coverage.include='src/weather/**'`(≥80%)
   - `npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'`(≥80%)
   - u4(UI)는 플로어 비대상(team.md Q4).
6. **정적 번들 빌드** — `npx vite build`(`dist-web/` 산출).

하나라도 실패하면 Job이 실패하고 배포 Job이 돌지 않는다(quality-gates.md 참조).

## 배포 단계(Job: `deploy`, `main` 푸시 한정)

- 조건: `github.ref == 'refs/heads/main'` AND `build-and-check` 성공(`needs`).
- GitHub Pages로 배포: `dist-web/`를 Pages 아티팩트로 업로드하고 `actions/deploy-pages`로 게시.
  (Vercel/Netlify를 쓰면 각 제공자의 Git 연동으로 `main` 머지 시 자동 배포로 대체 가능 —
  그 경우 이 Job 대신 제공자 대시보드 연결.)
- 비밀값 불필요(키 없는 공개 API, NFR6.1). Pages 배포 권한은 워크플로 `permissions`(pages: write, id-token: write)로만 부여.

## 워크플로 스케치(`.github/workflows/ci.yml`, 실제 파일은 배포 단계에서 작성)

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx prettier --check .
      - run: npx vitest run --coverage
      - run: npx vitest run src/astronomy --coverage --coverage.include='src/astronomy/**'
      - run: npx vitest run src/weather --coverage --coverage.include='src/weather/**'
      - run: npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'
      - run: npx vite build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist-web }
  deploy:
    needs: build-and-check
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

> 위 YAML은 설계 스케치다. 실제 `.github/workflows/ci.yml` 파일 작성·커버리지 임계값
> 강제 방식(예: vitest `coverage.thresholds` 또는 스크립트 체크)의 구체 구현은 Deployment
> Pipeline/Deployment Execution 단계에서 확정·반영한다.

## Sources

- ci-pipeline-questions.md Q1~Q4(CI 도구·브랜치·게이트·아티팩트 확정).
- team.md Way of Working(트렁크 기반), Deployment(무료 정적 호스팅·머지 시 배포), Testing Posture(커버리지 플로어), Code Style(ESLint/Prettier).
- build-and-test-summary.md·test-results.md(검증 명령 `npx tsc --noEmit && npx vitest run --coverage`, 핵심 모듈 플로어).
- project.md(비밀값 하드코딩 금지, 무료 티어 범위).

## Assumptions & Open Questions

- 깃 호스팅이 GitHub이라는 전제(GitHub Actions + Pages). Vercel/Netlify를 쓰면 배포 Job을 제공자 Git 연동으로 대체. [assumption]
- 실제 `.github/workflows/ci.yml` 파일 생성과 커버리지 임계값 강제의 구체 구현은 배포 단계에서 확정. [assumption]
