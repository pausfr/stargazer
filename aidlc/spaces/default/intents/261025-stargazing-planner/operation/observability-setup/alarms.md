# Alarms — stargazing-planner

> 1인 무료 정적 앱. 서버 알람 인프라(CloudWatch Alarm+SNS) 없음. 가벼운 수준의
> 선택적 알림만 둔다. 근거: observability-setup-questions.md, phases/operation.md(Observability).

## 알람 정의

| 알람 | 트리거 | 심각도 | 알림 대상 | 비고 |
|------|--------|--------|-----------|------|
| 배포 실패 | CI/배포 워크플로 실패 | 중 | 제공자 기본 알림(이메일) | GitHub Actions/Vercel/Netlify 기본 실패 통지 |
| 사이트 다운(선택) | 외부 무료 업타임 체크가 공개 URL 비정상 감지 | 중 | 해당 서비스 이메일 | 선택 도입(UptimeRobot 무료 등) |

- 알림 임계값은 SLO(가용성 99%/30일) 위반 전에 통지되도록 둔다(operation 가드레일).
  배포 실패는 즉시 통지(머지 시 배포라 실패 = 공개 중단 위험).

## CloudWatch/SNS 알람

- **해당 없음(N/A)** — 서버·AWS 없음. SNS 라우팅·에스컬레이션 체인 불필요(1인).

## Sources

- observability-setup-questions.md Q1·Q2, phases/operation.md(Observability: 알림 임계값은 SLO 위반 전).

## Assumptions & Open Questions

- 외부 업타임 체크 도입 여부는 사용자 선택(무료 티어). [assumption]
