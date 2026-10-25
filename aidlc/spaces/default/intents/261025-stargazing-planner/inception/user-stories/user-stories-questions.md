# User Stories — Story Plan & Questions

> requirements.md(FR1~FR6, NFR1~NFR7)를 사용자 스토리로 옮깁니다. 개인 앱이라 페르소나는 1~2개로 단순합니다.

## 스토리 계획 (초안)

- **페르소나**: 주 사용자 1명 — "취미 관측자(나와 친구들)". 별도 관리자/게스트 역할 없음.
- **스토리 형식**: As a [페르소나], I want [목표], so that [가치]. INVEST 준수, 수용 기준은 Given/When/Then.
- **분해 방식**: 기능 영역 기준 — (1) 연휴 목록 보기, (2) 추천 강조, (3) 상세 그래프 보기, (4) 데이터/오류 처리.
- **우선순위**: MoSCoW. 핵심 흐름(목록→추천→상세)은 Must.

## Q1. [제품] 페르소나 범위

페르소나를 어떻게 둘까요?

A. 1개 — "취미 관측자"만 (제안, 개인 앱)
B. 2개 — "취미 관측자" + "입문 친구"(용어를 덜 아는 친구)
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]: A

## Q2. [제품] 스토리 세분화 정도

스토리를 얼마나 잘게 나눌까요?

A. 기능 영역별로 적당히 (목록/추천/상세/오류처리 중심, ~8~12개) (제안)
B. 더 잘게 (화면 요소·상태별로 세분)
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]: A

## Assumptions & Open Questions

None.

## Consolidated Summary Confirmation

- 페르소나: 1개 — "취미 관측자(나와 친구들)".
- 분해: 기능 영역별(연휴 목록 / 추천 강조 / 상세 그래프 / 데이터·오류 처리)로 ~8~12개 스토리.
- 형식: INVEST + Given/When/Then 수용 기준, MoSCoW 우선순위(핵심 흐름 Must).
- requirements.md의 모든 FR·NFR을 스토리로 추적(traceability.json 작성).

- Looks correct
- Request changes

[Answer]: Looks correct
