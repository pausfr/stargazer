# Bolt Plan — 별 보기 좋은 날 추천 앱

> 근거: units-generation/unit-of-work.md, unit-of-work-dependency.md, contract-design/contract-summary.md, requirements.md, stories.md, delivery-planning-questions.md(Q1~Q8), 사용자 채팅 요청(워킹 스켈레톤 먼저).
> **Bolt** = Construction 단계를 한 번 통과하며 하나 이상의 단위(또는 그 최소 슬라이스)를 만들어 "실제로 돌아가는 무언가"로 끝내는 전달 조각이다. 이 문서는 Bolt의 경제적 순서(무엇을 먼저 만들지)를 기록한다.
> **워킹 스켈레톤** = 가장 얇은 엔드투엔드 슬라이스를 가장 먼저 세워 조각들이 실제로 연결되는지 증명하는 방식(Cockburn).
> 단위 DAG(런타임 빌드 경계): U1(천문)·U2(날씨) 독립 → U3(달력+추천) → U4(UI). 이 Bolt 순서는 bolt-plan의 경제적 계획이며, 엔진의 런타임 단위 빌드 경계(unit-of-work-dependency.md)를 바꾸지 않는다.

## 실행 전제 (Q1·Q3·Q4·Q7)

- 빌드 전략: 워킹 스켈레톤 먼저(Q1=A, 사용자 명시 요청).
- Bolt 크기: 단위 1개 = Bolt 1개를 기본으로 하되, 첫 Bolt만 스켈레톤을 위해 세 단위의 최소 슬라이스를 묶는다(Q3=A의 예외는 스켈레톤 1건).
- 실행: 순차(serial) + unit-major. 1인·AI 개발이라 한 번에 하나.
- 담당: 모든 Bolt는 개발자 에이전트(AI)가 수행(Team Formation SKIP).

## 단위 ↔ 컴포넌트 (components.md 참조)

Bolt가 다루는 단위는 domain-design의 컴포넌트 카탈로그(components.md)를 담는다:
- U1 u1-astronomy = AstronomyEngine
- U2 u2-weather-data = WeatherClient + DataCache
- U3 u3-domain-rules = HolidayCalendar + RecommendationEngine
- U4 u4-web-ui = HolidayListView + NightDetailView

각 Bolt의 Definition of Done·확신 가설은 위 컴포넌트들의 책임(components.md에 정의)을 그 단위가 실제로 구현했는지로 판정한다.

## Bolt 순서

### Bolt 1 — 워킹 스켈레톤 (최소 엔드투엔드 슬라이스) ⭐
- **포함(최소 슬라이스)**: U1 최소(한 날짜의 달 조도 계산), U3 최소(한 날짜의 단순 추천 판정 + 달력에서 날짜 하나 산출), U4 최소(메인 화면에 카드 1개 렌더링). **U2(날씨)는 스텁** — 구름량은 고정/빈 값으로 대체.
- **워킹 스켈레톤 마커**: YES. 증명하는 통합 경로 = U3→U1(달 조도 입력) 호출, U4→U3(추천)·U4→U1(조도) 호출, 정적 번들 빌드·구동.
- **Definition of Done**: 앱을 열면 한 날짜 카드가 실제 달 조도와 (조도만으로) 추천 여부와 함께 화면에 뜬다. 정적 번들이 빌드되어 브라우저에서 구동된다. 날씨 자리는 스텁 값.
- **확신 가설(무엇을 증명하나)**: "계산(U1) → 도메인 규칙(U3) → 화면(U4)의 모듈 호출 사슬이 실제로 연결되어 돌아가고, 정적 번들로 화면에 뜬다." 조각들의 연결과 화면 초안을 가장 먼저 확인.
- **기대 데모**: 브라우저에서 메인 화면을 열어 달 조도·추천 라벨이 붙은 카드 1개를 본다.

### Bolt 2 — 날씨 연동 (가장 위험한 부분 조기 검증)
- **포함**: U2 전체(WeatherClient 어댑터 + DataCache). Bolt 1의 날씨 스텁을 실제 무료 날씨 API 연동으로 교체.
- **워킹 스켈레톤 마커**: no.
- **Definition of Done**: 예보 범위 안 날짜는 실제 구름량이 카드/상세에 뜨고, 상태가 known/outOfHorizon/unknown으로 정규화된다(contract C2·C4). 캐시로 재호출이 억제된다. U3 추천이 구름 조건을 반영한다(조도+구름).
- **확신 가설**: "무료 날씨 API의 무료 한도·예보 지평·실패 처리가 설계(C4 어댑터, 3-상태)대로 실제로 동작한다." Q6에서 꼽은 최대 위험을 두 번째로 바로 검증.
- **기대 데모**: 가까운 날짜 카드에 실제 구름량이 뜨고, 먼 날짜는 "날짜가 가까워지면 표시", API를 막으면 "구름량 알 수 없음"으로 표시된다.

### Bolt 3 — 기능 완성 (살 붙이기)
- **포함**: U1·U3·U4의 나머지 기능. U1(박명 3종·완전한 밤·월출/월몰), U3(3개월+ 주말·공휴일 연휴 전체 목록·KST 밤 범위·임계값 규칙 완성), U4(상세 이중축 그래프·박명 음영·완전한 밤·요약·범례·추천 강조·로딩/부분/에러 상태·뒤로가기).
- **워킹 스켈레톤 마커**: no.
- **Definition of Done**: requirements.md의 FR1~FR6, stories.md의 US1.1~US4.2가 모두 구현되어 동작한다. 다크모드·모바일 우선·색 비의존 강조 등 NFR1·NFR2 충족.
- **확신 가설**: "스켈레톤 위에 전체 기능이 얹혀, 3개월 연휴 비교라는 핵심 가치가 실제로 성립한다."
- **기대 데모**: 메인 목록에서 3개월+ 연휴·주말 카드와 추천 강조를 보고, 카드를 눌러 상세 이중축 그래프(달 밝기·구름·박명·월출몰)를 확인하고 뒤로가기로 다른 날과 비교한다.

## DAG 정합성 (Step 3)

- Bolt 순서는 단위 DAG(U1·U2 → U3 → U4)를 위반하지 않는다. 첫 Bolt는 U2를 스텁으로 대체해 U1·U3·U4 최소 경로만 세우므로, U3·U4가 U2에 갖는 의존은 스텁 인터페이스로 충족된다(실제 U2는 Bolt 2에서 채움).
- 위상 순서에서의 유일한 의도적 편차: U2를 독립 단위임에도 뒤로 미룸. 사유 = 워킹 스켈레톤을 먼저 세우기 위함(risk-and-sequencing-rationale.md 참조). 스텁 경계가 있어 안전.

## Assumptions & Open Questions

- 스켈레톤의 날씨 스텁 인터페이스는 contract C2(CloudForecast, 3-상태)를 그대로 따른다. 구체 무료 날씨 API 선정은 Bolt 2 전에 확정(external-dependency-map.md). [assumption]
