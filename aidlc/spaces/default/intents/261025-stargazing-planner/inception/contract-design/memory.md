<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-10-26T08:31:33Z — 사용자가 Q6를 권장안 대신 직접 작성한 오류 모델로 교체; 날씨 상태를 known/outOfHorizon/unknown 3분류로 정규화하고 실패·타임아웃·파싱불가를 unknown(중립 "구름량 알 수 없음" 문구)으로 묶어 기존 "불러오기 실패" 문구(FR6.1)를 폐기. 예보 지평 밖(outOfHorizon)과 그 추천 유지(FR2.3/FR5.2/AC1.3.3)는 보존해 "3개월 비교" 핵심 가치와의 충돌을 피함. FR6.1만 하류에서 갱신 필요로 남김.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
