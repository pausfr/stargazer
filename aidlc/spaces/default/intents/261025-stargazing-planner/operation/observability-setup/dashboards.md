# Dashboards — stargazing-planner

> 정적 클라이언트 앱. 별도 대시보드 구축 없이 호스팅 제공자 기본 화면을 관측 대시보드로 쓴다.
> 근거: observability-setup-questions.md Q3, monitoring-design.md(u4), team.md Deployment.

## 사용 대시보드(제공자 기본)

| 대시보드 | 제공자 | 보는 것 |
|----------|--------|---------|
| Deployments / 배포 이력 | GitHub Pages(Actions) / Vercel / Netlify | 최근 배포 성공·실패, 롤백 지점 |
| Analytics / 트래픽 | 제공자 기본 Analytics(가능 시) | 방문 수·대역폭(가용성·트래픽 시그널) |
| 상태/업타임 | 제공자 상태 페이지 또는 외부 무료 업타임 체크(선택) | 공개 URL 200 응답 여부 |

## CloudWatch 등 서버 대시보드

- **해당 없음(N/A)** — 서버·AWS가 없어 CloudWatch 대시보드를 두지 않는다.

## Sources

- observability-setup-questions.md Q1·Q3, monitoring-design.md, phases/operation.md(Observability).

## Assumptions & Open Questions

- 제공자별 Analytics 제공 범위는 선택한 호스팅에 따라 다름(게시 후 확인). [assumption]
