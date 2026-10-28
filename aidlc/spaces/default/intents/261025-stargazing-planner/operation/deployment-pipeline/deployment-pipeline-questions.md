# Deployment Pipeline — 질문

> 무료 정적 웹 앱(Vite 번들, 백엔드 없음). team.md Deployment: 무료 정적 호스팅
> (GitHub Pages/Vercel/Netlify), `main` 머지 시 배포, 수동 프로덕션 승인 게이트 없음,
> 롤백은 제공자 이전 배포 복원 또는 직전 커밋 재배포. 아래는 그 전제에 맞춘 제안 답변.

## Q1. 배포 전략

어떤 배포 전략을 쓸까요?

A. **단일 환경 재배포(recreate)** — 정적 번들을 호스팅에 통째로 교체 게시. 서버·트래픽
   전환이 없는 정적 앱이라 blue/green·canary·rolling은 과하다. CDN이 새 번들을 서빙하면 전환 완료. (권장)
B. blue/green·canary 등 점진 전략
X. Other (please specify)

[Answer]: A

## Q2. 환경 승격 게이트(dev → staging → prod)

환경 승격은 어떻게 할까요?

A. **단일 환경** — 별도 dev/staging/prod 티어 없이 `main` → 운영(공개) 한 단계.
   PR/로컬에서 확인 후 `main` 머지 시 공개. 1인 개인 앱이라 다단계 승격 불필요. (권장)
B. 다단계 환경 승격(staging 경유)
X. Other (please specify)

[Answer]: A

## Q3. 프로덕션 승인 워크플로

프로덕션 배포에 수동 승인을 둘까요?

A. **수동 승인 게이트 없음** — team.md 확정대로. `main` 머지 = 공개. CI 품질 게이트
   (tsc·테스트·커버리지·빌드)가 통과해야 머지되므로 그게 사실상의 게이트. (권장)
B. 수동 승인 게이트를 둔다
X. Other (please specify)

[Answer]: A

## Q4. 롤백 절차

문제가 생기면 어떻게 되돌릴까요?

A. **제공자 이전 배포 복원 또는 직전 커밋 재배포** — (1) 호스팅 대시보드에서 직전
   성공 배포로 롤백(즉시), 또는 (2) `main`을 직전 정상 커밋으로 되돌려(revert) 재배포.
   정적 번들이라 DB 마이그레이션 롤백 등은 해당 없음. (권장, team.md)
B. 다른 롤백 절차
X. Other (please specify)

[Answer]: A

## Q5. 피처 플래그 전략

점진 출시용 피처 플래그를 둘까요?

A. **피처 플래그 없음** — 1인·단일 환경·정적 앱이라 다크 론치/점진 출시 인프라가
   불필요. 기능은 `main` 머지로 바로 공개. 필요해지면 다음 버전에서 도입. (권장)
B. 피처 플래그 도입
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
