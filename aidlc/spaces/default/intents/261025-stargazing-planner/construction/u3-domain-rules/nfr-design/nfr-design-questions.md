# NFR Design Questions — u3-domain-rules

> 단위 U3 u3-domain-rules (library). nfr-requirements(NFR3.1·NFR4.1·NFR5.1·NFR6.1~6.3·NFR-U3-MAINT.1)를 설계 패턴으로 옮깁니다. U3는 순수 규칙 라이브러리라 보안 설계는 입력 검증 게이트·순수성·상수 격리에 집중됩니다. 열린 설계 선택만 질문합니다.

---

## Q1. 설계 패턴 범위 확인
U3 보안·품질 설계를 다음 패턴으로 확정할까요?
- SD1 진입점 입력 검증 게이트(listCandidateDates/recommend, fail-fast, 예외 없이): DateRange·AstronomyResult·CloudForecast의 형식·범위 검증.
- SD2 순수성·결정론: 부작용·네트워크·전역 상태 없음, 시각은 주입.
- SD3 상수 격리: 추천 임계값(20/30)·공휴일 테이블 커버 범위·밤 구간 집계 방식을 단일 상수 모듈로.
- 논리 컴포넌트: HolidayCalendar(달력 산출), RecommendationEngine(추천 판정), 공유 상수 모듈.

- A. 이대로 확정(권장).
- B. 조정/추가(적어 주세요).

[Answer]: A

---

## Consolidated Summary Confirmation

아래 설계 패턴을 확정한 뒤 산출물(security-design.md·logical-components.md·traceability.json)을 생성합니다.

- SD1 진입점 입력 검증 게이트(listCandidateDates/recommend, fail-fast, 예외 없이): DateRange·AstronomyResult·CloudForecast 형식·범위 검증.
- SD2 순수성·결정론: 부작용·네트워크·전역 상태 없음, 시각 주입.
- SD3 상수 격리: 추천 임계값(20/30)·공휴일 테이블 커버 범위·밤 구간 집계 방식을 단일 상수 모듈로.
- 논리 컴포넌트: HolidayCalendar(달력 산출), RecommendationEngine(추천 판정), 공유 상수 모듈.

프롬프트: 이 설계대로 산출물을 생성해도 될까요?
- Looks correct
- Request changes

[Answer]: Looks correct
