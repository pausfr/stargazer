<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-25T10:30:10Z — 초기 설명은 은하수·행성·유성우·별자리 비교를 핵심으로 언급했으나, Q1 답변에서 사용자는 핵심 가치를 "달 위상 + 구름 + 박명 그래프"로 재정의함("좋은 밤만 고르면 어떤 이벤트든 예쁘다"). 핵심 요구는 메인의 추천 카드 목록(달 위상·날씨 기준 강조)과 상세의 이중축 그래프(x=시간, 좌y=달 밝기, 우y=구름량) + 박명 구간(시민/항해/천문) 시각화로 해석. 은하수/행성/유성우/별자리 비교는 확정 요구가 아닌 가정/열린 항목으로 보존.
- 2026-10-25T10:30:10Z — Q4: "주요 관측지 비교" 대신 박명 시각이 유의미하게 달라지는 한국 ~5개 지역 구획으로 단순화하기로 함(시골 관측 전제).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
