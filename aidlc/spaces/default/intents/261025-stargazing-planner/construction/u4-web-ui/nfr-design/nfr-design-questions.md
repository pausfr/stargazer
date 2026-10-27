# NFR Design — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: nfr-requirements(performance-requirements NFR3.1~3.5·security-requirements NFR6.1~6.4·tech-stack-decisions), functional-spec(§2 조립·§3 WF1·§4 WF2·§5 상태머신·§5.1 캐시·§6 WF3), contract-summary(C1·C2·C3). 설계 수준(패턴)만; 구현 코드는 code-generation.
> produces_kinds상 ui에 적용되는 NFR Design 산출물은 performance-design, security-design, logical-components, traceability다(scalability/reliability/observability-design은 service 전용 미적용).
> 대부분의 설계 전제는 상위에서 확정(상태머신·공유 캐시 소유·Chart.js·점진 렌더·색 비의존 강조). 아래는 u4 설계에 남은 구체 패턴 공백만 묻는다.

## Q1. [아키텍트] 논리 컴포넌트 분해

u4의 내부 논리 컴포넌트를 어떻게 나눌까요? (구현 파일 분해가 아니라 책임 경계)

A. 4개 논리 컴포넌트로 분해 — (1) AppRoot(공유 DataCache 단일 인스턴스·nowMs 보유, 라우팅/화면 전환), (2) NightViewAssembler(§2 NightView 조립: U1 동기 + U2 Promise + U3 recommend 묶기, 상태 loading/ok/partial/error 산출), (3) HolidayListView(WF1 카드 목록·추천 강조 렌더), (4) NightDetailView(WF2 Chart.js 이중축·박명 음영·요약·범례, WF3 재시도). 조립 로직(2)을 뷰(3·4)에서 분리해 테스트·재사용 용이 (권장)
B. 다르게 나눈다(예: 화면별 1:1, 또는 조립을 뷰에 흡수)
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 성능 설계 — 데이터 조립·렌더 패턴

NFR3(체감 로딩) 설계를 어떤 패턴으로 구체화할까요?

A. (1) NightViewAssembler가 날짜별로 U1 동기 계산을 먼저 반환해 카드/상세 골격을 즉시 렌더하고, U2 getCloudForecast(Promise)는 `Promise.all`로 병렬 수집해 도착 시 구름 부분만 갱신(점진 렌더). (2) 공유 DataCache 주입으로 재방문·재시도 캐시 히트(NFR3.4). (3) 상세 그래프는 단일 Chart.js 인스턴스, 날짜 전환 시 destroy/재생성 대신 data 갱신으로 재조립 비용 최소화. (4) 정량 목표 없이 수동 스모크(NFR3 정책) (권장)
B. 추가 성능 패턴이 필요하다(가상화·지연 렌더·정량 목표 등)
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 보안 설계 — 표시 전용 UI의 보안 패턴

security-requirements(NFR6.1~6.4)를 설계 패턴으로 어떻게 구체화할까요?

A. (1) 비밀값 비포함 — UI는 외부 호출을 U1·U2에 위임, 키 불필요 공개 API 전제(NFR6.1). (2) 안전 렌더 — 모든 표시 문자열(연휴명 label 등)은 프레임워크 기본 텍스트 바인딩으로만 렌더, innerHTML류 미사용(NFR6.2). (3) 내부 사유 비노출 — C2 reason·에러 code 등 내부 진단 값은 상태 매핑 계층에서 차단하고 사용자에겐 중립 문구만(NFR6.3). (4) 입력 표면 최소 — 사용자 입력·폼·세션 없음, 상호작용은 탭/뒤로가기/재시도뿐(NFR6.4) (권장)
B. 추가 보안 설계 고려가 있다
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
