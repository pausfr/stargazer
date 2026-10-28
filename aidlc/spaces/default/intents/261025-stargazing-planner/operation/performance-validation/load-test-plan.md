# Load Test Plan — stargazing-planner

> 근거: performance-validation-questions.md, performance-requirements.md(NFR3 정량 목표 없음),
> performance-design.md(PD1~PD4), team.md.

## 부하 테스트

- **해당 없음(N/A)** — 서버·백엔드가 없는 정적 CDN 서빙 앱이라 측정할 서버 엔드포인트가
  없다. 동시접속 부하는 호스팅 CDN과 브라우저가 처리하며, k6/Locust 류로 테스트할 대상이
  없다. 외부 날씨 API는 사용자별 호출·브라우저 캐시로 무료 한도 안에서 동작한다.

## 대신 수행하는 성능 검증(수동 스모크)

흔한 모바일 네트워크(DevTools throttling: Slow/Fast 3G, 4G)에서 브라우저로 1회:
1. 메인 목록: 진입 즉시 스켈레톤 → 천문 정보 먼저 → 구름량 점진 채움 → 수 초 내 완성(PD1·PD2·PD3).
2. 상세 차트: 진입 후 수 초 내 이중축 그래프 렌더(PD4 단일 인스턴스).
3. 같은 날짜 재방문: 캐시 히트로 재요청 없이 즉시 표시(PD3).
4. (선택) Lighthouse Performance 점수를 참고로 기록(강제 임계값 아님).

## 용량 계획

- 정적 CDN이라 용량은 제공자 무료 티어 대역폭에 의존. 1인 개인 앱 트래픽 규모에서 충분.
- 오토스케일링·인스턴스 사이징: N/A(서버 없음).

## Sources

- performance-validation-questions.md Q1·Q2, performance-requirements.md(NFR3), performance-design.md(PD1~PD4), team.md.

## Assumptions & Open Questions

None.
