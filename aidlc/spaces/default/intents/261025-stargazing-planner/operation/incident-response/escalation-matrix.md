# Escalation Matrix — stargazing-planner

> 1인 개인 앱이라 에스컬레이션 체인·온콜 로테이션이 없다. phases/operation.md의
> "런북은 에스컬레이션 경로·연락처를 포함한다" 요구를 1인 맥락에 맞춰 충족한다.
> 근거: incident-response-questions.md Q2.

## 담당·연락

| 역할 | 담당 | 연락 경로 |
|------|------|-----------|
| 개발·운영·온콜 | 개발자 본인(단일 담당) | 제공자 기본 알림 이메일(배포 실패) + 선택적 업타임 체크 이메일 |

- 별도 2차·3차 에스컬레이션 대상 없음(1인). 외부 의존(공개 날씨 API·호스팅 제공자)
  장애는 해당 제공자 상태 페이지를 참조하며, 사용자가 통제할 수 없는 부분은 대기·우아한 저하로 흡수.

## 통지 채널

| 이벤트 | 채널 |
|--------|------|
| 배포 실패 | GitHub Actions/Vercel/Netlify 기본 이메일 |
| 사이트 다운(선택) | 외부 무료 업타임 체크(UptimeRobot 등) 이메일 |
| 기능 회귀 | 본인/지인 사용 중 발견, 피드백 |

## 에스컬레이션 규칙

- P1(다운): 즉시 본인 대응(롤백). 지연 에스컬레이션 대상 없음.
- 호스팅/외부 API 제공자 측 장애로 본인이 조치 불가한 경우: 제공자 상태 페이지 확인,
  복구 대기, 필요 시 사용자(지인) 안내. 통제 불가 외부 장애는 본 앱의 인시던트 범위 밖으로 기록.

## Sources

- incident-response-questions.md Q2, incident-plan.md, phases/operation.md(Incident Response: 에스컬레이션·연락).

## Assumptions & Open Questions

None.
