# Architecture Decision Records — Domain Design

> 근거: components.md, requirements.md, team-practices.md, 인셉션 가드레일.

## ADR-001: 백엔드 없는 클라이언트 중심 구조

### Context
개인·무료 운영 제약(NFR5, NFR7), 비밀값 비하드코딩(NFR6), 소수 사용자. 서버를 두면 무료 범위·운영 부담이 커진다.

### Decision
모든 계산(천문)과 외부 호출(날씨 API)을 클라이언트(브라우저)에서 수행하는 정적 웹앱으로 만든다. 서버 상태 없음.

### Consequences
- (+) 무료 정적 호스팅으로 배포, 운영 단순, 서버 비용 없음.
- (+) team.md 배포 관행(머지 시 자동 배포)과 자연스럽게 맞음.
- (−) API 키를 숨길 서버가 없으므로 키 없는 공개 API 우선, 필요 시 프록시 여부를 별도 결정(project.md 학습).

### Alternatives Rejected
- 경량 백엔드(프록시/캐시)를 두는 안: 무료·단순 목표에 비해 과하여 반려(필요해지면 재검토).

## ADR-002: 추천 판정을 천문 계산과 분리 (RecommendationEngine)

### Context
추천 판정은 달 조도·구름 임계값과 규칙(구름 예보 유무에 따른 분기)에 의존하며, 이 임계값은 설계·사용 중 조정될 수 있다(FR2.4, 잠정 20%/30%).

### Decision
추천 판정을 AstronomyEngine과 분리된 RecommendationEngine 블록으로 둔다(Q1=A).

### Consequences
- (+) 임계값·규칙 변경이 결정론적 계산 블록을 건드리지 않는다.
- (+) 추천 규칙을 단위 테스트로 집중 검증(핵심 계산 모듈 커버리지 정책과 부합).
- (−) 블록이 하나 늘어 호출 흐름이 한 단계 추가된다(소규모라 부담 낮음).

### Alternatives Rejected
- 천문 계산 블록에 추천을 포함(Q1-B): 임계값 변경 시 계산 블록 수정이 필요해 결합도가 높아져 반려.

## ADR-003: 화면을 논리 컴포넌트로 모델링

### Context
메인 목록·상세 그래프는 작성할 코드이며, 데이터/계산 블록에 대한 의존 흐름을 명확히 할 필요가 있다.

### Decision
HolidayListView, NightDetailView를 도메인 설계의 컴포넌트로 포함한다(Q2=A).

### Consequences
- (+) 어느 화면이 어떤 데이터/계산 블록을 호출하는지 의존 그래프에 드러난다.
- (+) 화면과 계산의 변경률 차이를 경계로 분리.
- (−) UI 세부(레이아웃)는 여기서 다루지 않고 refined-mockups/구현에 맡긴다(중복 주의).

### Alternatives Rejected
- 데이터·계산 블록만 다루고 화면은 구현에서(Q2-B): 의존 흐름이 설계에 안 드러나 추적성이 약해져 반려.

## ADR-004: WeatherClient를 어댑터(포트)로, 캐시를 DataCache로 분리

### Context
무료 날씨 API는 선정·교체 가능성이 있고 호출 실패/예보 지평 한계가 있다. 무료 한도 보호가 필요하다(FR5, FR6.1, 캐시 정책).

### Decision
외부 날씨 API 접근을 WeatherClient 어댑터로 격리하고, 단기 캐시를 DataCache로 분리한다.

### Consequences
- (+) API 교체·실패 처리·"없음/실패" 구분이 한 경계에 모인다.
- (+) 캐시 정책을 한 곳에서 관리해 무료 한도 보호.
- (−) 작은 앱에 블록이 둘 늘지만 관심사 분리 이득이 더 큼.

### Alternatives Rejected
- 화면에서 직접 API 호출: 실패·캐시·교체가 화면마다 흩어져 반려.

## Assumptions & Open Questions

None.
