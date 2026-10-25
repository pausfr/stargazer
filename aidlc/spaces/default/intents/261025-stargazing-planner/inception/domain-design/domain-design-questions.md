# Domain Design — Questions

> 정적 클라이언트 앱이라 "컴포넌트"는 배포 단위가 아니라 코드로 작성할 논리 블록입니다. 날씨 API·천문 라이브러리는 컴포넌트가 아니라 외부 의존입니다.
> 제안 분해: 천문 계산 / 날씨 클라이언트 / 연휴·주말 달력 / 추천 판정 / 데이터 캐시 / 화면(목록·상세). 아래 두 가지만 확인합니다.

## Q1. [아키텍처] "추천 판정"을 별도 블록으로 둘지

추천(달 어두움 + 구름 적음) 판정 로직을 어디에 둘까요?

A. 천문 계산과 분리된 별도 블록(RecommendationEngine) — 임계값·규칙이 바뀌어도 계산 블록은 그대로 (제안)
B. 천문 계산 블록 안에 포함(별도로 안 나눔)
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]:A

## Q2. [아키텍처] 화면(UI)을 컴포넌트로 모델링할지

메인 목록·상세 그래프 같은 화면을 도메인 설계에서 컴포넌트로 다룰까요?

A. 네 — 화면도 코드 블록이므로 컴포넌트로(HolidayListView, NightDetailView). 데이터/계산 블록과 분리 (제안)
B. 아니요 — 이번 단계는 데이터·계산 블록만, 화면은 구현에서
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]:A

## Assumptions & Open Questions

None.

## Consolidated Summary Confirmation

- 논리 컴포넌트(코드 블록): AstronomyEngine(달·박명·월출몰 계산), WeatherClient(무료 날씨 API 어댑터), HolidayCalendar(3개월 주말·공휴일 연휴 산출), RecommendationEngine(추천 판정 — 별도 블록), DataCache(짧은 캐시), HolidayListView(메인 화면), NightDetailView(상세 그래프 화면).
- 외부 의존(컴포넌트 아님): 무료 날씨 API, 오픈소스 천문 계산 라이브러리, 무료 정적 호스팅.
- 엔티티 소유: ObservationNight(관측 밤 데이터)·CloudForecast·CalendarDate 등을 각 한 컴포넌트가 소유.
- ADR로 경계·소유·추천 분리 결정 기록. traceability.json로 US 스토리 전부를 컴포넌트에 매핑.

- Looks correct
- Request changes

[Answer]: Looks correct
