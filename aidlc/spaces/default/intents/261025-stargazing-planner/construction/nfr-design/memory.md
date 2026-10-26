<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-26T12:52:25Z — [unit u1-astronomy] 사용자가 u1에 한해 "핵심 체크포인트만 자동 진행" 방식을 택함(U2부터 매 단계 함께 복귀, 코드 생성 계획·단위 완료 검증은 반드시 확인). 엔진 autonomy 스위치는 전역이라 켜지 않고, 조정자가 u1 설계 단계의 리뷰 게이트만 자동으로 넘기는 방식으로 적용. NFR Design은 u1(library)에 새 사용자 판단 공백이 없어(보안·기술 선택은 NFR Requirements에서 확정) 질문 없이 설계로 진행.

## Deviations
- 2026-10-26T12:52:25Z — [unit u1-astronomy] Construction 질문은 예외적이라는 지침에 따라 nfr-design 질문 파일을 만들지 않고 바로 설계 산출물 생성. library kind라 produces는 security-design·logical-components·traceability만(성능/확장성/신뢰성/관측성 설계는 service/ui 전용).
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
