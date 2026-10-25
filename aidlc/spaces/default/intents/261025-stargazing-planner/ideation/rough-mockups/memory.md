<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-25T14:04:19Z — Q6에서 사용자가 UI 요구 2개 추가: (1) 기본 테마는 다크모드(밤 관측 준비 맥락), (2) 메인 카드의 "관측 좋은 날"(달 어두운 밤) 강조는 노란색 테두리 + 색만으로 전달 안 하게 아이콘/라벨 병행. 디자인·NFR에 반영.
- 2026-10-25T14:04:19Z — Q3가 A,B,C(날짜 간 이동 D 제외)이므로 상세 화면의 이전/다음 연휴 네비게이션은 MVP 제외, 뒤로가기로만 이동하는 흐름(Q4-A와 일치).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
