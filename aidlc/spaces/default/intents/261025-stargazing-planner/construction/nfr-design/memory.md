<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-27T08:22:13Z — [unit u4-web-ui] ui 단위라 produces_kinds상 performance-design·security-design·logical-components·traceability만 생성(scalability/reliability/observability-design은 service 전용 미적용). 설계 초점은 "느린/실패하는 외부 날씨를 천문 표시와 분리하는 점진 렌더"로, NightViewAssembler를 뷰에서 분리(AppRoot/조립기/목록/상세 4-컴포넌트)해 조립·상태 산출·내부 사유 차단을 한 곳에 모음. 성능은 정량 목표 없이 구조적 체감-지연 제거(즉시 스켈레톤·Promise.all 병렬·공유 캐시·단일 차트 data 갱신)로 설계, 수동 스모크 측정(NFR3 정책). 보안은 표시 전용이라 비밀값 비포함·텍스트 바인딩·내부 사유 비노출·입력 표면 최소에 집중.
- 2026-10-26T15:55:00Z — [unit u3-domain-rules] 리뷰 iter1 READY(Minor 3). security-design에 3건 명확화: ① recommend 분기 우선순위를 못박음(cloud.status 분기 먼저 → unknown이면 조도 비정상과 무관하게 deferred 유지, BR2.4 보존) ② SD2 시각-주입 서술을 현재 C3 계약(시각 의존 없음)에 맞게 조건부로 좁힘 ③ SD1의 throws 표현을 C2(throws:never 명시)/C3(throws 미선언, 동기) 구분으로 정정.
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
