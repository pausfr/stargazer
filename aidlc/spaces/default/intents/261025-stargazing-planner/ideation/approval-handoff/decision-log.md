# Decision Log — Ideation 단계

> Ideation 동안 내린 주요 결정 기록. 각 결정의 근거 단계를 표기한다.

| # | 결정 | 단계 | 근거 |
|---|------|------|------|
| D-1 | 핵심 가치는 천문 이벤트 비교가 아니라 "달 위상+구름+박명 그래프로 좋은 밤 고르기" | intent-capture | [intent-statement] |
| D-2 | 대상은 나와 친구들(취미 관측 경험자), 엄격한 성공 지표 없음 | intent-capture | [intent-statement] |
| D-3 | 데이터: 달·박명 직접 계산(오픈소스), 구름량 무료 날씨 API, 전부 무료 범위 | market-research / feasibility | [build-vs-buy] [feasibility-assessment] |
| D-4 | 날짜 범위 3개월; 먼 날은 달·박명만 확정, 날씨는 가까워지면 채움 | feasibility | [feasibility-assessment] |
| D-5 | 달 밝기 = 조도(0~100%); 데이터는 열 때 fetch + 짧은 캐시(잠정) | feasibility | [feasibility-assessment] |
| D-6 | 첫 버전은 전국 대표 좌표 하나; 지역 ~5구획 비교는 다음 버전으로 이월 | scope-definition | [scope-document] (intent-capture 5구획 확정을 번복) |
| D-7 | 월출·월몰 시각을 상세 그래프 MVP 필수 요소로 승격 | scope-definition | [scope-document] |
| D-8 | 화면 2개(메인 카드 목록 / 상세 그래프), 핵심 흐름=목록→카드→상세→뒤로 | rough-mockups | [wireframes] [user-flow] |
| D-9 | 기본 테마 다크모드; 추천 날 강조=노란 테두리+아이콘/라벨(색 비의존) | rough-mockups | [wireframes] |
| D-10 | 상세의 이전/다음 연휴 바로 이동은 MVP 제외(뒤로가기로 이동) | rough-mockups | [wireframes] |
| D-11 | "완전한 밤" = 저녁 천문박명 종료~새벽 천문박명 시작 한 구간으로 정의 | rough-mockups | [wireframes] (검토 지적 반영) |
| D-12 | Team Formation 건너뜀(개인 프로젝트) | team-formation | 단계 조건 스킵 |
| D-13 | Go — Inception으로 진행, 열린 위험은 설계에서 해소 | approval-handoff | [Q1] [Q2] [Q3] |

## 설계로 넘기는 열린 항목

- 무료 날씨 API 구체 선정(한국 운량 품질·무료 한도 검증)
- 천문 계산 라이브러리 선정(달 위상·박명·월출월몰 정확도)
- "추천(달 어두움)"과 "흐림"이 한 카드에 함께 보일 때의 신호 처리
- 전국 대표 좌표의 구체 위치
- 메인 카드에 비교용 핵심 수치 노출 여부(Refined Mockups)

## Assumptions & Open Questions

None.
