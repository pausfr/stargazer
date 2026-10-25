<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-25T13:00:14Z — Feasibility에서 열어둔 "지역 ~5구획 vs 가볍게" 미결을 Q1=A(Must)로 해소: 지역 구획 선택/비교는 MVP 포함. intent-capture 확정과 일치. [갱신: 요약 확인에서 사용자가 번복 — Q1을 Could로, 지역 구획 비교는 첫 버전 제외. 전국 대표 좌표 하나로 시작. intent-capture의 "5구획" 확정은 다음 버전 목표로 이월.]
- 2026-10-25T13:00:14Z — Q4에서 사용자가 월출/월몰 시각을 "관측에 매우 중요"하다며 상세 그래프의 MVP 요소로 승격. Q3에서는 D(월출월몰)가 Could였으나 이 답변이 그것을 Must로 끌어올림 → 상세 그래프 MVP = 달 밝기 곡선 + 구름량 곡선 + 박명 음영/완전한 밤 + 월출·월몰 시각.
- 2026-10-25T13:00:14Z — Q5=A(단일 지역 핵심 흐름 먼저, 그 다음 구획 비교)는 범위 축소가 아니라 빌드 순서 선호로 해석. [갱신: 사용자 번복으로 지역 구획 비교는 MVP에서 제외되고 다음 버전으로 이월됨 — 따라서 "구획은 여전히 MVP"라는 앞선 해석은 더 이상 유효하지 않음. 첫 버전은 전국 대표 좌표 하나.]

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
