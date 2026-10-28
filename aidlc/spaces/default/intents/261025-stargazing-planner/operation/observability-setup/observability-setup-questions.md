# Observability Setup — 질문

> 백엔드·서버가 없는 무료 정적 클라이언트 앱. CloudWatch·X-Ray 같은 서버 관측은
> 해당 없음(N/A). 관측 가능 표면은 (1) 호스팅 제공자 기본 분석(요청/대역폭), (2) 선택적
> 클라이언트 측 가벼운 오류 로깅뿐이다. 1인 개인 앱이므로 가벼운 수준으로 둔다.
> 근거: monitoring-design.md(u4), team.md, phases/operation.md(Observability).

## Q1. 추적할 골든 시그널(latency/traffic/errors/saturation)

A. **가벼운 클라이언트 중심 시그널** — (1) 가용성: 공개 URL 200 응답(호스팅 상태/업타임),
   (2) 트래픽: 호스팅 제공자 기본 방문/요청 통계, (3) 오류: 브라우저 콘솔/런타임 오류와
   날씨 API 호출 실패(선택적 클라이언트 로깅), (4) saturation: 해당 없음(서버 없음, 정적 CDN). (권장)
X. Other (please specify)

[Answer]: A

## Q2. SLO/SLI 정의

A. **가벼운 SLO**(1인 무료 앱 수준, phases/operation.md 정량화 요구 충족): 가용성 SLO
   "30일 롤링 윈도우에서 공개 URL 99% 이상 200 응답"(호스팅 제공자 업타임에 의존).
   정량 성능(로딩 속도) SLO는 두지 않고 performance-validation의 수동 스모크로 갈음. (권장)
X. Other (please specify)

[Answer]: A

## Q3. 대시보드 레이아웃

A. **제공자 기본 대시보드 사용** — 별도 대시보드 구축 없이 GitHub Pages/Vercel/Netlify의
   기본 Analytics·Deployments 화면을 관측 대시보드로 쓴다(가용성·트래픽·배포 이력). (권장)
X. Other (please specify)

[Answer]: A

## Q4. 로그 보존·집계

A. **서버 로그 없음(N/A)** — 정적 앱이라 서버 로그가 없다. 오류 로깅이 필요하면 선택적
   클라이언트 콘솔 로깅(민감정보·내부 사유 비노출, NFR6.3). 집계 인프라 미구축. (권장)
X. Other (please specify)

[Answer]: A

## Q5. 분산 트레이싱

A. **해당 없음(N/A)** — 단일 클라이언트·백엔드 없음이라 분산 트레이싱(X-Ray 등) 불필요. (권장)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
