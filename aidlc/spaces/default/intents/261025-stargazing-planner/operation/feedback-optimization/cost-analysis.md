# Cost Analysis — stargazing-planner

> 근거: feedback-optimization-questions.md Q2, team.md Deployment, project.md(무료 티어 범위).

## 비용 현황

| 항목 | 비용 | 비고 |
|------|------|------|
| 정적 호스팅 | $0 | GitHub Pages/Vercel/Netlify 무료 티어 |
| 날씨 데이터 API | $0 | 키 불필요 공개 API(Open-Meteo류), 무료 범위 |
| 천문 계산 | $0 | 오픈소스 라이브러리(astronomy-engine), 클라이언트 실행 |
| CI | $0 | GitHub Actions 소규모 무료 한도 |
| **합계** | **$0** | 런타임 유료 자원 없음 |

## 최적화 기회

- 비용 측면 최적화 대상 없음(전부 무료). project.md Mandated: 모든 런타임 데이터 소스를
  무료 티어 범위 안에서만 사용 — 준수.
- 성능/대역폭 측면에서 배경 이미지 3.6MB는 대역폭 무료 한도·초기 로딩에 영향 가능.
  무료 한도 압박이 생기면 이미지 최적화가 첫 조치(feedback-loop.md 백로그).

## FinOps 권고

- 현 규모(1인 개인 앱)에서 유료 전환 트리거 없음. 트래픽 급증 시 제공자 무료 대역폭 한도를
  먼저 확인하고, 초과 시 이미지 최적화 → 그래도 부족하면 CDN/호스팅 플랜 재검토(다음 버전).

## Sources

- feedback-optimization-questions.md Q2, team.md Deployment, project.md Mandated(무료 티어), performance-validation/test-results.md(번들 크기).

## Assumptions & Open Questions

None.
