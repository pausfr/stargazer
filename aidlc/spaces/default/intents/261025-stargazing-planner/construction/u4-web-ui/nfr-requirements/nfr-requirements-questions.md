# NFR Requirements — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: functional-design(functional-spec.md), requirements.md(NFR1~NFR7), contract-summary.md(C1·C2·C3), 메모리 학습(다크모드·강조·월출몰·캐시·Chart.js).
> u4는 소유 엔티티 없는 표시 전용 UI 단위다. produces_kinds상 ui에 적용되는 NFR 산출물은 performance-requirements, security-requirements, tech-stack-decisions, traceability다(scalability/reliability/observability는 service 전용이라 미적용).
> 대부분의 NFR은 상위에서 이미 확정(NFR1 다크모드·접근성, NFR2 모바일 우선, NFR4 온라인+캐시, NFR5 무료, NFR6 비밀값 비하드코딩, NFR7 정적 호스팅). 아래는 u4(UI)에 특유한 성능·기술 선택 공백만 묻는다.

## Q1. [아키텍트] 차트 렌더링 라이브러리

상세 그래프(WF2)는 이중축(달 밝기 기준선 + 구름량 곡선)과 박명 음영(annotation box)을 그려야 합니다(FR3.2·FR3.3). functional-spec는 Chart.js를 가정하고 있는데, 이 선택을 확정할까요? (A3 계열 기술 선택, C2/UI 경계)

A. Chart.js(+ chartjs-plugin-annotation)로 확정 — 무료·오픈소스(MIT), 키 불필요, 브라우저 동작, 이중축·annotation 음영 지원, 다크모드 색 지정 가능. 구체 버전은 code-generation 스캐폴딩에서 고정. functional-spec의 가정과 정합 (권장)
B. 다른 무료 차트 라이브러리(예: uPlot/ECharts 등) 또는 직접 SVG/Canvas 구현
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 성능 — 메인 목록 체감 로딩(NFR3)

NFR3는 "흔한 모바일 네트워크에서 메인 목록이 몇 초 내 표시"를 엄격한 정량 목표 없이 요구합니다. UI 단위에서 체감 로딩을 어떤 정책으로 보장할까요?

A. (1) 진입 즉시 스켈레톤 카드로 로딩 상태 표시(AC1.1.3), (2) 날짜별 U2 getCloudForecast 호출을 병렬(Promise.all)로 모아 체감 지연 단축, (3) 천문 계산(U1, 동기)은 날씨를 기다리지 않고 먼저 그려 점진 표시, (4) 공유 DataCache로 재방문 캐시 히트. 측정은 수동 스모크(흔한 모바일 네트워크에서 목록 몇 초 내 표시)로 하고 엄격한 ms 목표는 두지 않음 (권장)
B. 정량 목표(예: p75 TTI < Ns)를 명시적으로 두고 측정 수단을 설계
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 성능 — 상세 그래프 렌더(NFR3)

상세 그래프는 구름량 시간별 배열을 선으로, 박명 3구간+완전한 밤을 음영 box로 그립니다. 렌더 성능 정책은?

A. 한 날짜의 데이터량이 작으므로(밤 범위 시간별 ~12~15포인트) 추가 가상화/다운샘플링 없이 단일 차트 인스턴스로 렌더. 재시도(WF3)·날짜 재방문은 공유 캐시로 재조립 비용 최소화. 별도 정량 목표 없음(수동 스모크) (권장)
B. 추가 성능 고려(가상화/지연 렌더/정량 목표)가 필요하다
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 보안 — 표시 전용 UI의 보안 초점(NFR6)

u4는 비밀값·인증이 없고 외부 호출은 상위 단위(U1 계산, U2 날씨 API)에 위임합니다. UI 단위의 보안 요구 초점은?

A. (1) 비밀값·키를 UI 코드/번들에 두지 않는다(NFR6; 날씨 API는 키 불필요 공개 API를 U2가 소유). (2) 외부 데이터 표시 시 안전한 렌더링 — reason 등 내부 사유 필드(C2 unknown의 reason)는 UI에 노출하지 않고, 표시 문자열은 프레임워크의 기본 이스케이프로 렌더(XSS 표면 최소화). (3) 사용자 입력 수집 없음(계정·폼 없음)이라 입력 검증 표면이 거의 없음 (권장)
B. 추가 보안 고려사항이 있다 (자유 기술)
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
