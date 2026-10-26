<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
- 2026-10-26T06:07:48Z — 단위 경계를 관심사(레이어)별 4단위로 결정; 1인·무료 정적 앱이라 화면별(기능별) 묶기보다 계산/데이터/규칙/UI 레이어 분리가 변경률 경계와 테스트 집중(핵심 계산 모듈 커버리지 정책)에 더 맞아 Q1=A, Q2=A 채택. 컴포넌트 7개를 그대로 7단위로 두는 안은 1인 관리에 과분하다고 판단.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
