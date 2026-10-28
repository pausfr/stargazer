# Deployment Execution — 질문

> 무료 정적 웹 앱. 실제 "인터넷 공개"가 이뤄지는 단계. 다만 공개는 호스팅 계정 연결·
> 게시가 필요하고, 그 계정·자격증명은 사용자 소유라 제가 대신 외부에 올릴 수 없습니다.
> 아래 Q1이 핵심 결정입니다. 근거: cd-config.md, deployment-strategy.md,
> environment-inventory.md, team.md.

## Q1. 실제 공개(게시)를 지금 할까요?

지금 이 단계에서 실제 배포(공개 URL 생성)를 어떻게 처리할까요?

A. **지금은 "배포 준비 완료"로 문서화만** — 제가 로컬 빌드로 산출물(`dist-web/`)이
   정상인지 확인하고, 실제 게시에 필요한 단계(호스팅 연결·푸시)를 런북으로 남깁니다.
   실제 공개는 사용자가 본인 호스팅 계정으로 수행(제가 외부 계정에 올리지 않음). (권장 — 안전)
B. **제가 특정 명령으로 공개를 시도** — 예: GitHub Pages 워크플로 커밋·푸시 등. 단,
   이는 사용자 호스팅/깃 계정·권한이 이 셸에 연결돼 있어야 하고 공개 URL이 생기는
   되돌리기 번거로운 외부 작업이므로, B를 고르면 어떤 제공자로 어떤 명령을 쓸지 함께 알려주세요.
X. Other (please specify)

[Answer]: A

## Q2. 배포 전 점검

배포 전 점검은 무엇으로 할까요?

A. **로컬 빌드·테스트 통과 확인** — `npx tsc --noEmit && npx vitest run`(167개 green,
   이미 확인됨) + `npx vite build`(`dist-web/` 산출). 정적 앱이라 DB 마이그레이션·
   의존 서비스 가용성 점검은 해당 없음(런타임 외부 의존은 공개 날씨 API 하나, 키 불필요). (권장)
X. Other (please specify)

[Answer]: A

## Q3. DB 마이그레이션

데이터베이스 마이그레이션이 필요한가요?

A. **해당 없음** — 상태를 보관하는 DB가 없는 정적 클라이언트 앱. (권장)
X. Other (please specify)

[Answer]: A

## Q4. 배포 창(window)

언제 배포할까요?

A. **상시(머지 시 배포)** — 별도 배포 창 없음. 사용자가 공개를 실행하는 시점이 배포 시점
   (1인 개인 앱, 트래픽 영향 없음). (권장)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
