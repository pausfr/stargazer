# Delivery Planning — 질문

> 근거: 모든 Inception 산출물(requirements, stories, mockups, components, units, contracts), team-practices.
> 이 단계는 "빌드 묶음(Bolt)"의 순서를 정한다. Bolt = Construction 단계를 한 번 통과하며 하나 이상의 단위(Unit)를 만들어 "돌아가는 무언가"로 끝내는 전달 조각이다. 단위 간 의존 위상(DAG)은 units-generation이 이미 정했고, 여기서는 그 DAG가 허용하는 경로 중 "무엇을 먼저 만들지"라는 경제적 판단만 한다.
> 맥락: 1인·AI 개발(Team Formation 건너뜀 → 모든 Bolt는 개발자 에이전트가 수행), 백엔드 없는 단일 정적 번들. 단위 DAG: U1(천문)·U2(날씨) 독립 → U3(달력+추천) → U4(UI).

## Q1. [딜리버리] 무엇을 먼저 만들까 (빌드 우선 전략)

A. 얇은 엔드투엔드 슬라이스 먼저(워킹 스켈레톤) — "한 날짜에 대해 달 조도 계산 → 단순 추천 → 메인 카드 1개 표시"가 처음부터 돌아가게 만들고 살을 붙인다 (권장: 조각들이 실제로 연결되는지 가장 먼저 증명)
B. 위험한 부분 먼저 — 외부 날씨 API 연동(무료 한도·예보 지평·실패 처리)처럼 불확실성이 큰 데를 먼저
C. 가치 높은 부분 먼저 — 메인 목록+추천 강조(핵심 화면)부터
X. Other (please specify)

[Answer]:A

## Q2. [딜리버리] 공식 점수 모델로 순위를 매길까

A. 아니오 — 단위가 4개뿐이고 DAG가 순서를 거의 정하므로 공식 점수(WSJF 등) 없이 DAG + 위 전략으로 순서를 정한다 (권장)
B. 예 — WSJF류로 가치·긴급도 ÷ 크기 점수화 (가중치는 자유 기술)
X. Other (please specify)

[Answer]:A

## Q3. [딜리버리] Bolt 하나의 크기

A. 단위 1개 = Bolt 1개 — U1, U2, U3, U4를 각각 하나의 Bolt로 (권장: 1인 개발, 단위 경계가 이미 깔끔)
B. 관련 단위를 묶어 더 큰 Bolt로
C. 단위를 가로지르는 얇은 슬라이스로
X. Other (please specify)

[Answer]:A

## Q4. [딜리버리] 여러 Bolt를 동시에 vs 순서대로

A. 순서대로(serial) — 1인·AI 개발이라 한 번에 하나씩, DAG 순서(U1·U2 → U3 → U4)대로 (권장)
B. 동시에(병렬) — 독립 단위(U1·U2)를 병렬로
X. Other (please specify)

[Answer]:A (스켈레톤 우선 요청으로 변경: 1인·AI 개발, DAG 순서대로 순차. 독립 단위 병렬은 워킹 스켈레톤 최소 슬라이스 먼저 세우는 흐름과 상충하여 철회)

## Q5. [딜리버리] 외부 의존이 발목을 잡을 게 있나

A. 거의 없음 — 무료 날씨 API와 오픈소스 천문 라이브러리뿐이고 둘 다 공개·무료. 승인 대기나 타팀 핸드오프 없음. 외부 날씨 API만 "선정·무료 한도 확인"이 U2 Bolt 전에 필요 (권장)
B. 그 외 신경 쓸 외부 의존이 있다 (자유 기술)
X. Other (please specify)

[Answer]:A

## Q6. [딜리버리] 이 빌드에서 가장 걱정되는 것 (먼저 다룰 위험)

A. 외부 날씨 API의 무료 한도·예보 지평·실패 처리가 실제로 설계대로 동작하는지 — U2를 일찍 검증 (권장)
B. 천문 계산(달 조도·박명·월출몰)의 정확도
C. 이중축 그래프 UI 렌더링
D. 특별히 없음 / 그 외 (자유 기술)
X. Other (please specify)

[Answer]:A

## Q7. [딜리버리] Construction 진행 방식

새 워크플로 기본값은 "단위별 진행(unit-major), 각 단위마다 체크포인트"입니다. 1인 개발에 맞는 방식을 고릅니다.

A. 기본값 유지 — 단위 하나씩 끝까지(설계~코드 생성) 만들고 각 단위 완료 체크포인트에서 검증 (권장)
B. 단계별 진행(stage-major) — 여러 단위의 같은 단계를 함께
X. Other (please specify)

[Answer]:A (스켈레톤 우선 요청으로 변경: 워킹 스켈레톤은 한 단위의 최소 슬라이스를 끝까지 세워 돌려보는 접근이라 unit-major와 맞음. stage-major는 철회)

## Q8. [딜리버리] Construction 검증 명령

각 단위 완료 시 돌릴 "검증 명령"을 정합니다(완성된 단위가 실제로 동작하는지 확인). 아직 코드가 없는 새 프로젝트라, 지금 정하거나 첫 체크포인트로 미룰 수 있습니다.

A. 지금은 미루고 첫 체크포인트에서 정한다 — 프로젝트 스캐폴딩(빌드 도구·테스트 러너) 후 실제 명령을 확정 (권장: 아직 package.json·테스트 설정 전)
B. 지금 특정 명령으로 정하고 싶다 (자유 기술, 예: `bun test`)
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
