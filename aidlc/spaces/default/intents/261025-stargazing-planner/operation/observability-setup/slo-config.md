# SLO / SLI Config — stargazing-planner

> 가벼운 SLO(1인 무료 정적 앱). phases/operation.md의 정량화 요구를 충족하되 과하지 않게.
> 근거: observability-setup-questions.md Q2.

## SLI / SLO

| SLI | 정의 | SLO | 측정 |
|-----|------|-----|------|
| 가용성 | 공개 URL이 200으로 응답하는 비율 | **30일 롤링 윈도우에서 99% 이상** | 제공자 업타임/외부 무료 업타임 체크 |
| 앱 로드 성공 | 페이지 로드 시 `#app`에 UI가 렌더(콘솔 치명 오류 0) | 비정량(수동 스모크로 확인) | 게시 후 수동 스모크·사용자 피드백 |

- 성능(로딩 속도)의 정량 SLO는 두지 않는다 — 팀이 정량 ms 목표 없음으로 결정(team.md),
  performance-validation 단계의 수동 스모크로 갈음.

## 오류 예산(error budget)

- 가용성 99%/30일 → 월 약 7.2시간 다운 허용. 1인 개인 앱이라 엄격한 번레이트 경보·피처
  프리즈 정책은 두지 않고, 배포 실패·장기 다운 시 수동 대응(rollback-runbook).

## Sources

- observability-setup-questions.md Q2, team.md Deployment(정량 성능 목표 없음), phases/operation.md(SLO 정량화·30일 윈도우 예시).

## Assumptions & Open Questions

- 99% 가용성은 선택한 무료 호스팅 제공자의 업타임에 사실상 의존한다. [assumption]
