# CI Pipeline — 질문

> 무료 정적 웹 앱(Vite 번들). team.md Deployment: 무료 정적 호스팅(GitHub Pages/
> Vercel/Netlify), `main` 머지 시 배포, 트렁크 기반(단일 `main`). 아래는 그 전제에
> 맞춘 제안 답변이며, 바꾸고 싶으면 `[Answer]:`를 직접 수정하세요.

## Q1. CI 도구

어떤 CI 도구로 파이프라인을 구성할까요?

A. **GitHub Actions** — 깃 호스팅이 GitHub이면 추가 비용 없이(퍼블릭/소규모 무료 한도)
   `main` 푸시·PR에서 tsc·테스트·린트·빌드를 돌리고, GitHub Pages 배포까지 한 워크플로로
   엮기 쉬움. 무료 정적 호스팅 전제와 정합. (권장)
B. 다른 CI(Vercel/Netlify 빌드 훅, GitLab CI 등) 또는 직접 지정
X. Other (please specify)

[Answer]: A

## Q2. 브랜치 전략

어떤 브랜치 전략을 쓸까요?

A. **트렁크 기반(단일 `main`)** — team.md 확정대로. 기능 브랜치·PR 리뷰 같은 무거운
   협업 절차 없이 `main`에 직접 커밋/머지, 변경 근거는 커밋 메시지로. CI는 `main`
   푸시에서 돈다. (권장)
B. 다른 전략(기능 브랜치 + PR 게이트 등)
X. Other (please specify)

[Answer]: A

## Q3. 머지(배포) 전 품질 게이트

머지/배포 전에 어떤 품질 게이트를 강제할까요?

A. **tsc + 테스트 + 커버리지 플로어 + 린트/포맷**:
   (1) `npx tsc --noEmit`(타입 오류 0),
   (2) `npx vitest run`(전체 테스트 green),
   (3) 핵심 계산 모듈(u1/u2/u3) 80% 라인 커버리지 플로어(경로 한정 측정),
   (4) ESLint/Prettier 검사,
   (5) `npx vite build` 성공(정적 번들 산출).
   하나라도 실패하면 머지/배포 차단. (권장, team.md Testing Posture·Code Style 정합)
B. 더 느슨하게/엄격하게 조정
X. Other (please specify)

[Answer]: A

## Q4. 아티팩트 저장소

어떤 아티팩트 저장소를 쓸까요?

A. **별도 아티팩트 저장소 없음** — 정적 번들(`dist-web/`)을 CI가 빌드해 정적 호스팅
   (GitHub Pages/Vercel/Netlify)에 바로 배포. 컨테이너 레지스트리·패키지 저장소 불필요
   (백엔드 없음, NFR7). (권장)
B. 별도 저장소 사용(S3/레지스트리 등)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
