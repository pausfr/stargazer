# Deployment Log — stargazing-planner

> 선택: Q1=A("배포 준비 완료" 문서화). 실제 공개(게시)는 사용자가 본인 호스팅 계정으로
> 수행한다 — 자격증명이 조정자 셸에 없고, 공개 URL 생성은 되돌리기 번거로운 외부 작업이라
> 조정자가 임의로 외부에 올리지 않는다. 근거: deployment-execution-questions.md,
> cd-config.md, deployment-strategy.md, environment-inventory.md.

## 상태: 배포 준비 완료(미게시)

- 정적 번들이 로컬에서 정상 산출됨. 공개 게시는 미수행(사용자 실행 대기).

## 배포 전 점검(수행함)

| 점검 | 명령 | 결과 |
|------|------|------|
| 타입·테스트 | `npx tsc --noEmit && npx vitest run` | 167 passed / 0 failed(이전 단계에서 확인) |
| 정적 번들 산출 | `npx vite build` | 성공(43 모듈) |
| 산출물 확인 | `ls dist-web/` | `index.html` + `assets/`(index JS 322KB·gzip 117KB, index CSS 3.97KB, milkyway_bg PNG 3.6MB) |
| 비밀값 점검 | 소스/번들 | 시크릿 없음(키 없는 공개 API, NFR6.1) |
| 런타임 외부 의존 | 공개 날씨 API | 키 불필요·HTTPS·CORS, 브라우저에서 직접 호출 |

> 참고(비차단): 배경 이미지 `milkyway_bg`가 3.6MB로 번들에서 가장 큼. 공개 후 초기
> 로딩이 느리면 이미지 최적화(압축/WebP/지연 로딩)를 다음 버전에서 고려. 현재 기능·게시엔 영향 없음.

## 실제 게시 런북(사용자 수행)

실제 공개는 아래 중 택1로 사용자가 본인 계정에서 수행한다. 어느 쪽도 `main` 기준.

### GitHub Pages (리포가 GitHub일 때 가장 단순)
1. 리포지토리 Settings → Pages → Source를 "GitHub Actions"로.
2. `.github/workflows/ci.yml` 추가(ci-config.md의 스케치대로: build-and-check + deploy Job).
3. `main`에 푸시 → 워크플로가 `dist-web/`를 Pages로 게시 → 제공자 기본 URL에서 공개.

### Vercel / Netlify
1. 대시보드에서 리포지토리 연결(무료 티어).
2. 빌드 명령 `npx vite build`, 출력 디렉터리 `dist-web` 지정.
3. `main` 푸시 시 자동 빌드·배포 → 제공자 기본 URL에서 공개.

### 게시 후 할 일
- smoke-test-results.md의 스모크 체크리스트를 공개 URL에서 1회 수행.
- 문제 시 rollback-runbook.md(제공자 이전 배포 복원 또는 `main` 직전 커밋 재배포).

## Sources

- deployment-execution-questions.md(Q1=A), cd-config.md·deployment-strategy.md·rollback-runbook.md, environment-inventory.md, build-and-test/test-results.md.

## Assumptions & Open Questions

- 공개 URL은 사용자 게시 후 생성됨(현재 미정). 게시하면 이 로그·health-check-report에 URL을 추가할 수 있다. [assumption]
