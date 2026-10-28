# Performance Validation — 질문

> 무료 정적 클라이언트 앱. 팀이 정량 성능 목표(ms/TTI)를 두지 않기로 확정(team.md),
> 성능 검증은 수동 스모크로 갈음한다. 서버가 없어 부하 테스트·오토스케일링 검증은 N/A.
> 근거: performance-requirements.md(NFR3 정량 목표 없음), performance-design.md(PD1~PD4).

## Q1. 부하 테스트를 할까?

A. **부하 테스트 안 함(N/A)** — 서버·백엔드가 없는 정적 CDN 서빙이라 동시접속 부하는
   CDN·브라우저가 처리한다. 외부 날씨 API는 사용자별 호출·캐시로 무료 한도 안에서 동작.
   별도 load test 도구(k6/Locust 등)로 측정할 서버 엔드포인트가 없다. (권장)
X. Other (please specify)

[Answer]: A

## Q2. 성능 목표(NFR)를 어떻게 검증할까?

A. **수동 스모크로 체감 검증** — NFR3는 정량 목표가 없는 정책 NFR이므로(team.md),
   흔한 모바일 네트워크(throttling 포함)에서 (1) 메인 목록이 스켈레톤→수 초 내 표시,
   (2) 상세 차트가 수 초 내 렌더되는지를 브라우저로 1회 확인한다. 참고 지표로 Lighthouse
   점수를 선택적으로 본다(강제 임계값 아님). (권장)
X. Other (please specify)

[Answer]: A

## Q3. 참고로 볼 지표·개선 여지

A. **번들 크기 관찰** — 현재 번들에서 배경 이미지 `milkyway_bg`가 3.6MB로 가장 크다.
   초기 로딩 체감이 느리면 이미지 최적화(압축/WebP/지연 로딩)를 다음 버전에서 고려.
   기능·게시엔 영향 없으며 강제 목표는 아니다(관찰 항목). (권장)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
