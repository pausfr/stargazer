<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-25T15:18:43Z — 추천 판정 기준이 "달 위상만"(rough-mockups/practices 노트)에서 Q1=B·Q2=B로 확정 변경: 추천 = 달 조도 낮음 AND (가까운 날이면) 구름 적음. 구름 많으면 추천 강조 제외. 리뷰에서 나온 "추천 vs 흐림 모순"을 해소. 단, 먼 날짜는 날씨 예보가 없으므로 그 경우 추천은 달 조도만으로 판정(구름 조건은 데이터가 생기면 적용)으로 해석.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
