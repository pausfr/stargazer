# Initiative Brief — 별 보기 좋은 날 추천 앱

> Ideation 전 단계 산출물을 한 장으로 모은 요약. 근거: intent-statement.md, stakeholder-map.md, competitive-analysis.md, feasibility-assessment.md, constraint-register.md, scope-document.md, intent-backlog.md, wireframes.md.

## 의도·문제

시간 낼 수 있는 주말·공휴일 연휴 중 "별 보기 좋은 밤"을 고르는 일이 흩어진 정보(달 위상·구름·박명)를 매번 조합해야 해서 번거롭다. 이 앱은 그 판단을 한 화면에서 직관적으로 돕는다. [intent-statement]

## 대상·성공 기준

- 대상: 나와 친구들(취미 관측 경험자). [stakeholder-map]
- 성공: "이 연휴 고민해볼까?" 결정에 바로 도움이 되면 충분(엄격한 지표 없음, 개인 도구). [intent-statement]

## 시장 검증 요약

상시 쓰는 기존 앱 없이 LLM+수동 조합에 의존 중 → 대체가 아니라 흩어진 작업의 통합이 가치. 데이터는 무료 범위 우선, 천문은 직접 계산 쪽. [competitive-analysis] [build-vs-buy]

## 실현 가능성·위험 요약

- 실현 가능: 달·박명은 오픈소스로 직접 계산, 구름량은 무료 날씨 API, 무료 정적 호스팅. [feasibility-assessment]
- 핵심 전제: 먼 날짜는 날씨 예보가 없으니 달·박명만 확정으로 보여주고 날씨는 가까워지면 채운다. [feasibility-assessment]
- 주요 위험: 무료 날씨 API의 한국 운량 품질·한도, "추천(달 어두움) vs 흐림" 카드 신호의 상호작용, 천문 라이브러리 선택 → 설계에서 해소(사용자 수용). [raid-log] [Q2]

## 범위 경계

- 첫 버전 포함: 3개월 연휴 카드 목록(달 위상 기준 추천 강조), 상세 이중축 그래프(달 밝기·구름량)+박명 음영/완전한 밤+월출·월몰, 전국 대표 좌표 하나, 무료 호스팅. [scope-document]
- 다음 버전: 한국 ~5개 지역 구획 선택/비교. [scope-document]
- 제외: 평년 기후값 추정, 개인화, 천문 이벤트 비교, 계정·공유·알림·기록. [scope-document]

## 콘셉트 비주얼

메인 카드 목록(다크모드, 추천 날 노란 테두리) + 상세 그래프 화면. [wireframes]

## 팀 계획

개인 프로젝트 — 팀/몹 없음(Team Formation 해당 없음, 건너뜀). 의사결정자=본인. [stakeholder-map]

## Go/No-Go 권고

**Go** — Inception(설계)으로 진행. 방향·위험 모두 사용자 확인 완료. [Q1] [Q2] [Q3]

## Assumptions & Open Questions

- 무료 날씨 API 선정, 천문 라이브러리 선정, "추천 vs 흐림" 신호 처리, 전국 대표 좌표 위치는 설계 단계에서 확정한다. [assumption]
