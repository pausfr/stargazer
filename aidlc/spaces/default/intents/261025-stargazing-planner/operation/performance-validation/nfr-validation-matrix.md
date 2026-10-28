# NFR Validation Matrix — stargazing-planner

> 성능·관련 NFR의 목표 대 실제. 정량 성능 목표가 없는 정책 NFR은 수동 스모크로 판정.
> 근거: performance-requirements.md, performance-design.md, load-test-plan.md.

## 매트릭스

| NFR | 목표 | 실제/검증 | 판정 |
|-----|------|-----------|------|
| NFR3.1 스켈레톤 로딩 | 진입 즉시 로딩 상태 표시 | 코드 반영(listView 스켈레톤), 게시 후 스모크 | Met(구조) |
| NFR3.2 병렬 수집 | 날짜별 날씨 병렬(직렬 합 아님) | 코드 반영(Promise.all, PD2) | Met |
| NFR3.3 점진 렌더 | 천문 먼저, 날씨 지연 채움 | 코드 반영(assembler 2단계, PD1) | Met |
| NFR3.4 공유 캐시 재히트 | 재방문 재요청 없음 | 코드 반영(AppRoot 공유 DataCache, PD3) | Met |
| NFR3.5 단일 차트 인스턴스 | destroy/재생성 없이 data 갱신 | 코드 반영(NightChart, PD4) | Met |
| NFR3 정량 로딩 목표 | (팀이 정량 목표 미설정) | 수동 스모크로 "수 초 내 표시" 확인(게시 후) | N/A(정책: 정량 목표 없음) |
| 가용성(참고) | 99%/30일(slo-config) | 호스팅 제공자 업타임 의존 | 게시 후 관찰 |

- scalability/throughput/오토스케일링: **N/A** — 서버 없는 정적 앱(scalability-requirements·
  scalability-design 산출물 자체가 없음, ui/정적 특성상 미적용).

## 용량 계획 권고

- 현 규모(1인 개인 앱)에서 무료 티어로 충분. 트래픽이 커지면 배경 이미지 최적화가 가장
  효과적인 첫 개선(test-results.md 관찰).

## Sources

- performance-requirements.md(NFR3), performance-design.md(PD1~PD4), load-test-plan.md, slo-config.md.

## Assumptions & Open Questions

- 정량 로딩·가용성 최종 수치는 게시 후 공개 환경에서 확정. [assumption]
