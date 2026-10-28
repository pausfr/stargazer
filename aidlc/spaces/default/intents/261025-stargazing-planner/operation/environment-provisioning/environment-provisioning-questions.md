# Environment Provisioning — 질문

> 이 앱은 백엔드·AWS가 없는 무료 정적 웹 앱이다. 표준 질문(VPC/서브넷/Secrets
> Manager/교차 계정)은 대부분 해당 없음(N/A)이며, 실제 "환경"은 선택할 무료 정적
> 호스팅 제공자 하나다. 아래는 그 맥락에 맞춘 답변. 근거: team.md Deployment, NFR7,
> infrastructure-specification.md, cd-config.md.

## Q1. 환경이 Infra Design대로 프로비저닝됐나?

A. **단일 정적 호스팅 환경 하나** — Infra Design(정적 번들·무료 호스팅)대로, 서버·DB·
   큐·VPC 없는 정적 호스팅 1개. 프로비저닝 작업은 "호스팅에 리포지토리 연결 + 빌드 명령·
   출력 디렉터리 지정"으로 끝난다(실 연결은 Deployment Execution에서). (권장)
X. Other (please specify)

[Answer]: A

## Q2. VPC/서브넷/보안그룹/NACL이 올바른가?

A. **해당 없음(N/A)** — 정적 호스팅은 네트워크 토폴로지(VPC·서브넷·SG·NACL)를
   사용자가 구성하지 않는다(제공자가 CDN으로 서빙). 보안 경계는 HTTPS 기본 제공과
   최소 배포 권한뿐. (권장)
X. Other (please specify)

[Answer]: A

## Q3. Secrets Manager / Parameter Store 주입이 올바른가?

A. **해당 없음(N/A)** — 애플리케이션 비밀값이 없다(키 없는 공개 API, NFR6.1). 번들·
   호스팅 설정에 시크릿을 두지 않는다. 호스팅/CI용 배포 토큰이 필요하면 CI 시크릿으로만
   두고 번들에는 포함하지 않는다. (권장)
X. Other (please specify)

[Answer]: A

## Q4. 교차 계정 / 교차 VPC 연결이 검증됐나?

A. **해당 없음(N/A)** — 단일 호스팅·백엔드 없음이라 교차 계정·교차 VPC 연결 자체가
   없다. 런타임 외부 연결은 브라우저 → 공개 날씨 API(U2) 한 방향뿐이며 CORS·HTTPS로
   동작. (권장)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
