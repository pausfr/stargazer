# CD Config — stargazing-planner

> 무료 정적 웹 앱(Vite 번들)의 지속적 배포(CD) 구성. 단일 환경·머지 시 배포.
> 근거: deployment-pipeline-questions.md(Q1~Q5), ci-config.md·quality-gates.md,
> team.md Deployment, NFR7(정적 호스팅).

## 배포 모델

- **단일 환경, 머지 시 배포(recreate).** `main`에 머지되면 CI의 품질 게이트(G1~G8)가
  통과한 뒤 `deploy` Job이 정적 번들(`dist-web/`)을 호스팅에 통째로 게시한다.
- 서버·트래픽 전환이 없으므로 blue/green·canary·rolling은 쓰지 않는다.
- 별도 dev/staging/prod 티어 없음. PR·로컬에서 확인 후 `main` 머지 = 공개.

## CD 파이프라인(CI 워크플로의 `deploy` Job)

- CI(`ci-config.md`)와 한 워크플로로 통합: `build-and-check` 성공 + `main` 푸시일 때만
  `deploy` Job 실행(`needs: build-and-check`, `if: github.ref == 'refs/heads/main'`).
- GitHub Pages 경로: `actions/upload-pages-artifact`(`dist-web/`) → `actions/deploy-pages`.
- Vercel/Netlify 경로(대안): 제공자 Git 연동으로 `main` 푸시 자동 빌드·배포. 이 경우
  별도 `deploy` Job 대신 제공자 대시보드에서 빌드 명령(`npx vite build`)·출력 디렉터리
  (`dist-web`)만 지정.

## 프로덕션 승인

- **수동 승인 게이트 없음**(team.md). `main` 머지 전 CI 품질 게이트가 사실상의 관문이다
  (tsc·린트·테스트·커버리지·빌드). 1인 개인 앱이라 별도 사람 승인 단계를 두지 않는다.

## 비밀값·권한

- 배포에 애플리케이션 비밀값 불필요(키 없는 공개 API, NFR6.1).
- GitHub Pages 배포 권한만 워크플로 `permissions`(pages: write, id-token: write)로 최소 부여.
- Vercel/Netlify를 쓰면 제공자 토큰은 CI 시크릿으로 두고 번들에는 포함하지 않는다.

## 승격 매트릭스

| 환경 | 트리거 | 게이트 | 배포 방식 |
|------|--------|--------|-----------|
| 운영(공개) | `main` 푸시/머지 | CI G1~G8 통과 | 정적 번들 통째 교체(recreate) |

(별도 staging/prod 티어 없음 — 단일 환경.)

## Sources

- deployment-pipeline-questions.md Q1~Q5.
- ci-config.md·quality-gates.md(CI Job·게이트), infrastructure-specification.md(정적 호스팅), cicd-pipeline.md(u4 인프라 설계).
- team.md Deployment(머지 시 배포·수동 승인 없음), project.md(비밀값 금지).

## Assumptions & Open Questions

- 호스팅 제공자 최종 선택(GitHub Pages / Vercel / Netlify)은 Environment Provisioning에서 확정. [assumption]
