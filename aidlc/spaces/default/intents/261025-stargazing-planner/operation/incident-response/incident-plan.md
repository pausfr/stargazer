# Incident Plan — stargazing-planner

> 1인 개인 무료 정적 앱의 가벼운 인시던트 계획. 근거: incident-response-questions.md,
> phases/operation.md(Incident Response).

## 심각도 등급

| 등급 | 정의 | 대응 시간(목표) | 대응 |
|------|------|-----------------|------|
| P1 | 사이트 완전 다운/앱이 뜨지 않음 | 발견 즉시 | RB1/RB3로 롤백, 원인 수정 후 재배포 |
| P2 | 부분 저하(날씨만 안 나옴, 특정 화면 오류) | 편할 때 | RB2/RB3, 설계된 저하면 조치 불필요 |

- 엄격한 SLA·MTTR 목표는 두지 않음(1인 개인 앱). 가용성 SLO는 slo-config.md(99%/30일).

## 탐지

- 배포 실패: 제공자 기본 통지(alarms.md).
- 사이트 다운: 선택적 외부 업타임 체크 또는 본인 사용 중 발견.
- 기능 회귀: 배포 후 스모크·사용자(본인/지인) 피드백.

## 대응 흐름

1. 탐지 → 심각도 판정(P1/P2).
2. P1: 즉시 롤백(RB1/RB3) → 스모크 재확인 → 원인 수정.
3. P2: 설계된 저하인지 확인(RB2) → 아니면 수정 후 배포.
4. P1 종료 후 가벼운 사후 기록(incident-plan "사후 검토").

## 사후 검토(포스트모템)

- P1 1건당: 타임라인·원인·재발 방지(테스트 추가 여부)를 커밋 메시지 또는 짧은 메모로 1회 기록.
- 정식 블레임리스 프로세스·정기 리뷰 회의는 과함(1인). 반복되는 같은 원인은 다음 버전 백로그로.

## Sources

- incident-response-questions.md Q1·Q4, runbooks.md, slo-config.md, phases/operation.md.

## Assumptions & Open Questions

None.
