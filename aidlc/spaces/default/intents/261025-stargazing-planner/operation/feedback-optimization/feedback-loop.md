# Feedback Loop — stargazing-planner

> 운영/구축에서 얻은 통찰을 다음 반복(Ideation)으로 돌려보낸다. 근거: project.md(이월 학습),
> performance-validation/test-results.md, 이번 사이클 재작업 교훈.

## 이번 사이클에서 쌓인 교훈(이미 메모리에 반영)

- 상류 결정이 하류로 가며 증발할 수 있음 → 단계마다 전달 확인(월출·월몰 "없음" 표시 사례).
- 달 체감 밝기 곡선은 남중=100% 정규화 + 대기소광(airmass)으로 결정적 계산.
- 월출·월몰 탐색 대칭화(결함 6). 기능 변경 시 테스트는 '정합 조정'으로 갱신, 플로어는 안 낮춤.
- 교차 단위 traceability.json 스키마를 표준(`upstream_ids`+순수 경로 `target`)으로 통일.
- UI는 className과 스타일시트가 한 쌍으로 완결돼야 하고, 차트 컨테이너는 명시 높이 필요.
- 1인 무료 정적 앱에선 설계 산출물이 "작동"보다 "문서화"에 가깝고, 실제 화면 품질은 수동
  스모크가 반드시 필요(체크포인트 반려 두 번이 이를 보여줌).

## 다음 반복 백로그(우선순위)

| # | 항목 | 근거 | 우선 |
|---|------|------|------|
| 1 | 한국 ~5개 지역 구획 선택/비교(현재 전국 대표 좌표 1개) | intent-capture·scope-definition 이월(project.md) | 높음 |
| 2 | 배경 이미지 최적화(3.6MB → 압축/WebP/지연 로딩) | performance-validation/test-results.md | 중 |
| 3 | 상세 화면 이전/다음 연휴 바로 이동 네비게이션 | rough-mockups 이월(project.md) | 중 |
| 4 | 천문 이벤트(은하수·행성·유성우·별자리) 비교 | intent-capture 열린 항목(project.md) | 낮음(열린 항목) |
| 5 | 게시 후 공개 환경 성능·접근성 수동 스모크 결과 반영 | deployment-execution·performance-validation | 게시 후 |
| 6 | (선택) 클라이언트 오류 로깅·외부 업타임 체크 도입 | observability-setup | 낮음 |

## 운영 통찰 → Ideation 전달

- 게시 후 제공자 Analytics(트래픽)·가용성·지인 피드백을 모아 위 백로그 우선순위를 조정한다.
- 가장 큰 가치 가설: 지역 구획(1번)이 "시골 관측" 사용자 가치에 직접 기여 → 다음 반복 1순위 후보.

## Sources

- project.md Corrections(이월 학습), performance-validation/test-results.md, slo-report.md, cost-analysis.md, 이번 사이클 재작업 교훈.

## Assumptions & Open Questions

- 백로그 우선순위는 게시 후 실사용 피드백으로 조정. [assumption]
