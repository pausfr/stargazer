# Units of Work — 별 보기 좋은 날 추천 앱

> 근거: domain-design/components.md, domain-design/decisions.md, requirements-analysis/requirements.md, user-stories/stories.md, units-generation-questions.md(Q1~Q5=A).
> 이 문서는 "무엇을 어떤 단위로 만드는가"(단위 정의)만 다룬다. 빌드 순서·우선순위·크리티컬 패스는 다음 단계(Delivery Planning)가 이 단위의 의존 DAG를 입력으로 결정한다.

## 단위 경계 전략 (Q1=A, Q2=A)

관심사(레이어)별로 묶어 **굵은 4개 단위**로 분해한다. 7개 도메인 컴포넌트는 변경률과 책임이 비슷한 것끼리 묶인다:

- 결정론적 천문 계산 → `u1-astronomy`
- 외부 날씨 데이터 접근 + 캐시 → `u2-weather-data`
- 날짜 달력 + 추천 판정(도메인 규칙) → `u3-domain-rules`
- 두 화면(메인 목록 + 상세 그래프) → `u4-web-ui`

백엔드 없는 단일 정적 번들이므로 단위 간 연결은 브라우저 안의 동기 모듈 호출이다(Q4=A). 외부 경계는 두 곳뿐: `u1`의 천문 계산 라이브러리, `u2`의 무료 날씨 API.

## 단위 ID ↔ 디렉터리

| Unit ID | Directory | Kind |
|---------|-----------|------|
| U1 | u1-astronomy | library |
| U2 | u2-weather-data | library |
| U3 | u3-domain-rules | library |
| U4 | u4-web-ui | ui |

## 단위 정의

### U1 — u1-astronomy (library)
- **설명**: 날짜(KST)와 전국 대표 좌표로 달 조도, 박명(시민·항해·천문) 시각, 완전한 밤 구간, 월출·월몰 시각을 결정론적으로 계산하는 순수 계산 라이브러리.
- **포함 컴포넌트**: AstronomyEngine
- **소유 엔티티**: AstronomyResult (`dateKstId` 키)
- **책임(owns & delivers)**:
  - 달 조도(0~100%) 계산 (FR4.2)
  - 박명 3종 및 완전한 밤 구간 계산 (FR3.3)
  - 월출·월몰 계산, 없을 때 "없음" 표기 (FR3.4, AC3.2.3)
  - 전국 대표 좌표·KST 기준 계산 (FR4.1, C3)
- **외부 의존**: 오픈소스 천문 계산 라이브러리
- **배포 모델**: embedded (단일 정적 번들의 일부)
- **복잡도**: M
- **구현 노트/제약**: 순수 함수·결정론적(네트워크 없음). 핵심 계산 모듈이므로 ~80% 라인 커버리지 플로어 적용(team-practices). 좌표의 구체 위치·천문 라이브러리 선정은 Functional Design에서 확정(A3).

### U2 — u2-weather-data (library)
- **설명**: 무료 날씨 API에서 시간별 구름량 예보를 가져오고 짧은 TTL로 캐시하는 데이터 접근 라이브러리(어댑터 + 캐시).
- **포함 컴포넌트**: WeatherClient, DataCache
- **소유 엔티티**: CloudForecast (`dateKstId` 키)
- **책임(owns & delivers)**:
  - 구름량 예보 조회 (FR5.1)
  - 예보 지평 유무 판별 → "예보 없음" 반환 (FR5.2, AC1.3.3)
  - 호출 실패 시 "실패" 반환(부분 상태 지원) (FR6.1)
  - 단기 캐시 보관·만료로 무료 한도 보호 (FR5.3, AC4.1.2)
- **외부 의존**: 무료 날씨 API(Open-Meteo류, 키 불필요 우선)
- **배포 모델**: embedded
- **복잡도**: M
- **구현 노트/제약**: 비밀값 비하드코딩(NFR6, project.md Forbidden). 키가 꼭 필요하면 프록시 여부를 Functional Design에서 결정. API·예보 지평·운량 필드·무료 한도 확정은 Functional Design(A2). 온라인 전제, 오프라인 전용 저장 없음(NFR4).

### U3 — u3-domain-rules (library)
- **설명**: 주말·공휴일 연휴 날짜 산출(달력)과 "관측 좋은 날" 추천 판정(규칙)을 담는 도메인 규칙 라이브러리. U1·U2의 결과를 입력받아 판정한다.
- **포함 컴포넌트**: HolidayCalendar, RecommendationEngine
- **소유 엔티티**: CalendarDate (`dateKstId` 키)
- **책임(owns & delivers)**:
  - 3개월 이상 앞의 주말·공휴일 연휴 날짜 산출, 연휴 없으면 주말 포함 (FR1.1, FR1.2)
  - "그날 밤" KST 범위 결정 (FR1.4, AC1.1.2)
  - 추천 판정: 예보 있는 날은 달 조도 낮음 AND 구름 적음, 예보 없는 날은 달 조도만 (FR2.2, FR2.3)
  - 잠정 임계값 보유: 조도 ≤ 20%, 구름 ≤ 30% (FR2.4) — 규칙과 임계값을 한 곳에 모아 계산과 분리(ADR-002)
- **외부 의존**: 한국 공휴일 데이터/규칙
- **배포 모델**: embedded
- **복잡도**: M
- **구현 노트/제약**: 추천 판정 로직은 핵심 계산 모듈로 ~80% 커버리지 플로어 적용(team-practices). 임계값은 Functional Design에서 수치 확정(A1). 공휴일 데이터 소스는 Functional Design에서 확정.

### U4 — u4-web-ui (ui)
- **설명**: 다크모드 모바일 우선 웹 화면 2종 — 메인 연휴·주말 카드 목록과 상세 이중축 그래프. U1·U2·U3을 호출해 데이터를 모아 렌더링한다.
- **포함 컴포넌트**: HolidayListView, NightDetailView
- **소유 엔티티**: 없음(표시 전용)
- **책임(owns & delivers)**:
  - 메인 카드 목록 렌더링(날짜/연휴명, 달 아이콘+조도, 구름 요약) (FR1.3, US1.1~US1.3)
  - 추천 강조(노란 테두리 + 별 아이콘 + "추천" 라벨, 색 비의존) (FR2.1, NFR1, AC2.1.4)
  - 상세 이중축 그래프(x=시간, 좌y=달 밝기, 우y=구름량) + 박명 음영/완전한 밤 (FR3.2, FR3.3)
  - 핵심 숫자 요약(완전한 밤·월출·월몰)·범례 (FR3.4, FR3.5)
  - 뒤로가기 네비게이션(이전/다음 연휴 바로 이동 없음) (FR3.6, US3.3)
  - 로딩/성공/부분/에러 상태 구분, 날씨 실패 시 부분 표시, 천문 실패 시 에러+재시도 (FR6.1~FR6.3, US4.1, US4.2)
- **외부 의존**: 없음(브라우저 런타임)
- **배포 모델**: standalone 번들 엔트리(단일 정적 배포의 진입점, NFR2·NFR7)
- **복잡도**: L
- **구현 노트/제약**: 다크모드 기본, 모바일 세로 우선·데스크톱 비파괴(NFR2). 접근성: 색만으로 정보 전달 금지(NFR1). UI는 수동 스모크로 보완(커버리지 플로어는 핵심 계산 모듈에만, team-practices). 그래프 렌더링 방식(라이브러리 등)은 Functional Design/구현에서 결정.

## 배포 모델 (Q5=A)

네 단위 모두 하나의 정적 번들로 함께 빌드·배포한다(모놀리식 단일 배포). U1~U3은 U4에 임베드되는 라이브러리이고, U4가 번들 진입점이다. 무료 정적 호스팅에 `main` 머지 시 자동 배포(team-practices Deployment).

## Assumptions & Open Questions

- 전국 대표 좌표의 구체 위치, 천문 계산 라이브러리, 무료 날씨 API와 그 예보 지평·운량 필드·무료 한도, 추천 임계값의 최종 수치, 공휴일 데이터 소스, 그래프 렌더링 방식은 Functional Design/NFR 단계에서 확정한다. [assumption]
