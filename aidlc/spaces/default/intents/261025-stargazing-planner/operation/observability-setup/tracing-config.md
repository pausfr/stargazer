# Tracing Config — stargazing-planner

> 근거: observability-setup-questions.md Q5.

## 분산 트레이싱

- **해당 없음(N/A)** — 단일 클라이언트 앱, 백엔드·서비스 간 호출 없음. X-Ray 등 분산
  트레이싱 불필요. 런타임 외부 호출은 브라우저 → 공개 날씨 API 한 방향뿐이며, 그 성공/실패는
  상태 매핑(ok/partial)과 선택적 콘솔 로깅으로 충분히 관측된다.

## Sources

- observability-setup-questions.md Q5, contract-summary.md(C2 단일 외부 경계), functional-spec.md(§5 상태머신).

## Assumptions & Open Questions

None.
