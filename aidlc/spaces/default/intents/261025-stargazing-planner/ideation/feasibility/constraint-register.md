# Constraint Register — 별 보기 좋은 날 추천 앱

> 이 앱은 개인·친구용 모바일 웹앱이다. 규제·조직·외부 시스템 연동 제약은 해당 없음(intent-statement.md, stakeholder-map.md). 아래는 실제로 작용하는 제약만 정리한다.

## 기술 제약

| ID | 제약 | 성격 | 출처 |
|----|------|------|------|
| TC-1 | 무료 날씨 API의 운량 예보 지평이 짧다(보통 ~2주). 3개월 범위의 먼 날짜는 예보가 없다. | 데이터 가용성 | [Q1] (market-trends.md) |
| TC-2 | 전부 무료 범위 안에서 운영해야 한다(API 무료 한도 포함). | 비용 | [Q5] (build-vs-buy.md) |
| TC-3 | 서버 상태를 두지 않는 무료 정적 호스팅을 쓴다 → 계산·API 호출은 클라이언트에서. | 아키텍처 | [Q3] [Q2] |
| TC-4 | 모바일 우선 UI(작은 화면에서 이중축 그래프·박명 음영이 읽혀야 함). | UX·구현 | intent-statement.md 핵심 가치 |

## 조직·규제 제약

| ID | 제약 | 비고 |
|----|------|------|
| OC-1 | 없음 — 개인 프로젝트, 공식 보고·승인 체계 없음 | stakeholder-map.md |
| RC-1 | 없음 — 개인정보/로그인 미수집(계정·로그인 범위 제외), 규제 대상 아님 | intent-statement.md [Q7 from intent-capture] |

## 운영 제약

| ID | 제약 | 비고 |
|----|------|------|
| PC-1 | 데이터는 열 때 받아오고 짧게 캐시해 무료 한도를 보호한다. | [Q4] [assumption] |
| PC-2 | 사용자는 소수(나와 친구들)로, 높은 동시성·확장성 요구 없음. | intent-statement.md, stakeholder-map.md |

## Assumptions & Open Questions

- TC-2/PC-1의 "무료 한도 내 운영"은 사용자가 소수라는 전제에 기반한 가설이다. [assumption]
