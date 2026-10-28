# Anomaly Detection Config — stargazing-planner

> 근거: observability-setup-questions.md, phases/operation.md.

## 이상 탐지

- **자동 이상 탐지 미구성(가벼운 수준)** — 1인 무료 정적 앱이라 CloudWatch Anomaly
  Detection 같은 자동 기준선 학습은 과하다. 대신:
  - 배포 실패는 제공자 기본 통지로 즉시 인지(alarms.md).
  - 트래픽·가용성 이상은 제공자 Analytics·선택적 업타임 체크를 사람이 간헐 확인.
  - 날씨 API 무료 한도 초과·장애는 앱이 `unknown` 상태로 우아하게 저하(구름만 비표시),
    사용자 재방문·캐시로 흡수 — 별도 이상 알람 불필요.

## Sources

- observability-setup-questions.md Q1, slo-config.md, functional-spec.md(partial/unknown 저하), phases/operation.md.

## Assumptions & Open Questions

None.
