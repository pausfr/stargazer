<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-26T14:07:44Z — [unit u2-weather-data] 예보 지평 판별을 2단계로 합침(사용자 Q4 보완 + Q3 응답기반을 조정자가 통합, 사용자 1번 승인): ① 요청일 > 오늘(KST)+14일이면 API 호출 없이 outOfHorizon(호출 절감, NFR5) ② 14일 이내면 호출해 구름량 있으면 known, 실패/타임아웃/파싱불가/결측이면 unknown. 14일은 상수 1개로 분리. outOfHorizon은 "14일 초과"로만, unknown은 "14일 이내 실패/결측"으로 명확히 분리.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
- 2026-10-26T12:09:28Z — [unit u1-astronomy] AC3.2.3("월출/월몰 없으면 '없음'으로 구분 표시")의 UI 표현을 "null이면 항목 생략"으로 바꿀지는 U4(web-ui) Functional Design에서 확정해야 함. 사용자는 Q1 수정답에서 "생략"을 원했으나, U1은 계산 라이브러리라 null 반환까지만 담고 UI 표시는 U4 책임. U4 설계 시 AC3.2.3 갱신 검토.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
