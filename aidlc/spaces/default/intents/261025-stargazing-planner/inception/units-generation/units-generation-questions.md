# Units Generation — 질문

> 근거: domain-design/components.md, domain-design/decisions.md, requirements-analysis/requirements.md, user-stories/stories.md.
> 이 단계는 컴포넌트를 "구현·테스트 가능한 작업 단위(Unit)"로 묶고, 단위 간 의존 그래프(DAG, 위상)를 만든다.
> 빌드 순서/우선순위(무엇을 먼저 만들지)는 다음 단계(Delivery Planning)가 정하므로 여기서는 정하지 않는다.

## Q1. [아키텍트] 단위 경계 전략

이 앱은 백엔드 없는 정적 클라이언트 앱이고, 도메인 설계에서 7개 논리 컴포넌트(AstronomyEngine, WeatherClient, HolidayCalendar, RecommendationEngine, DataCache, HolidayListView, NightDetailView)가 나왔습니다. 이걸 어떤 기준으로 작업 단위(Unit)로 묶을지 정합니다.

A. 관심사(레이어)별로 묶기 — 순수 계산(천문)·데이터 접근(날씨+캐시)·도메인 규칙(추천+달력)·UI 화면의 결로 나눈다 (권장)
B. 화면(기능)별로 묶기 — 메인 목록 단위와 상세 그래프 단위를 중심으로, 각 화면이 필요한 계산/데이터를 끌어안게 나눈다
C. 컴포넌트 1개 = 단위 1개 — 7개 컴포넌트를 그대로 7개 단위로
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 단위 粒度(세분화) 선호

단위를 굵게(개수 적게) 둘지, 잘게(개수 많게) 둘지입니다. 1인 프로젝트·무료 정적 앱 맥락을 고려하세요.

A. 굵은 단위(3~4개 안팎) — 관리 단순, 1인 개발에 적합 (권장)
B. 잘게(6~8개) — 단위별 독립성·병렬성 최대화
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 단위 종류(kind) 태깅

각 단위가 "무엇인지"를 service / spec / ui / packaging / library 로 태깅하면 Construction 단계에서 어떤 설계 산출물이 적용되는지가 정해집니다. 이 앱은 배포되는 서버(service)가 없고, 재사용 코드(library)와 프론트엔드 화면(ui)이 중심입니다. 어떻게 태깅할까요?

A. 계산·데이터·도메인 규칙 단위는 `library`, 화면 단위는 `ui` 로 태깅 (권장)
B. 모든 단위를 태깅하지 않고(전체 설계 산출물 매트릭스 적용)
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 단위 간 통합 방식

백엔드가 없으므로 단위 간 연결은 브라우저 안의 함수/모듈 호출입니다(네트워크 경계 아님). 통합 방식을 어떻게 기록할까요?

A. 모두 동기 함수 호출(모듈 import)로 기록 — 외부 경계는 WeatherClient가 날씨 API를, AstronomyEngine이 천문 라이브러리를 호출하는 것만 (권장)
B. 그 외 다른 통합 방식을 쓰고 싶다
X. Other (please specify)

[Answer]:A

## Q5. [아키텍트] 배포 모델

A. 단일 배포(모놀리식) — 하나의 정적 번들로 무료 호스팅에 함께 배포 (권장)
B. 단위별 독립 배포
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
