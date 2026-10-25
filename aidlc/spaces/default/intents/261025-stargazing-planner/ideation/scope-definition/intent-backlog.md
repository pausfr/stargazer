# Intent Backlog — 별 보기 좋은 날 추천 앱

> 프로토-Unit(큰 덩어리) 수준의 우선순위 백로그. MoSCoW로 분류한다. 상세 분해는 이후 Requirements/User Stories/Units 단계에서 한다.
> 근거: scope-document.md, intent-statement.md, feasibility-assessment.md, 이 단계 답변.

## Must Have (첫 버전 필수)

| ID | 프로토-Unit | 왜 필수 | 출처 |
|----|-------------|---------|------|
| B-1 | 연휴·주말 날짜 산출 (3개월 범위) | 카드 목록의 기반 데이터 | intent-statement.md [Q5] |
| B-2 | 천문 계산 (달 위상·조도, 박명 시민/항해/천문, 월출·월몰) — 전국 대표 좌표 1곳 | 핵심 데이터, 상세 그래프의 근간 | [Q1] [Q3] [Q4] feasibility-assessment.md |
| B-3 | 날씨(구름량) 연동 — 무료 API, 가까운 날만 | 추천·그래프의 날씨 축 | [Q2] [Q3] constraint-register.md |
| B-4 | 메인 카드 목록 + 달 위상 기준 추천 강조 | "결정 돕기" 진입점 | [Q2] intent-statement.md |
| B-5 | 상세 이중축 그래프 (달 밝기·구름량·박명 음영·완전한 밤·월출월몰) | 핵심 가치 화면 | [Q3] [Q4] intent-statement.md |
| B-6 | 예보 지평 구분 표시 (가까운 날=날씨 포함, 먼 날=달·박명만) | 3개월 비교 성립의 전제 | feasibility-assessment.md [memory:feasibility] |
| B-7 | 모바일 웹 UI + 무료 정적 호스팅 배포 | 실제 사용 가능하게 | feasibility-assessment.md [Q from feasibility] |

## Should Have (중요하나 첫 버전 필수는 아님)

| ID | 프로토-Unit | 비고 | 출처 |
|----|-------------|------|------|
| B-8 | 데이터 캐시 (열 때 fetch + 짧은 캐시) | 무료 한도 보호. 단순 구현이면 Must로 올릴 수 있음 | [memory:feasibility] [assumption] |

## Could Have (다음 버전 후보)

| ID | 프로토-Unit | 비고 | 출처 |
|----|-------------|------|------|
| B-9 | 한국 ~5개 지역 구획 선택/비교 | 첫 버전 제외, 다음 버전 1순위 | [Q1] intent-statement.md |

## Won't Have (이번에는 안 함)

| ID | 항목 | 출처 |
|----|------|------|
| B-10 | 먼 날짜 평년 기후값 추정 표시 | [Q4] |
| B-11 | 즐겨찾기/메모 등 개인화 | [Q4] |
| B-12 | 은하수·행성·유성우·별자리 비교 (열린 항목) | [Q4] intent-statement.md [assumption] |
| B-13 | 계정/로그인, 친구 공유, 푸시 알림, 과거 기록 저장 | intent-statement.md |

## 가치 흐름 (value stream)

데이터(연휴 날짜 + 천문 계산 + 날씨) → 메인 카드 목록(좋은 밤 강조) → 카드 선택 → 상세 그래프(한눈에 판단) → "이 연휴 고민해볼까?" 결정. [Q5] intent-statement.md

## Assumptions & Open Questions

- B-8(캐시)은 구현 난도를 보고 Must/Should를 최종 확정한다. [assumption]
- 프로토-Unit은 큰 덩어리이며, 실제 Unit 경계는 Units Generation에서 확정한다. [assumption]
