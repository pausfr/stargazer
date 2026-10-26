# NFR Requirements — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: functional-design(entities/rules/functional-spec), requirements.md(NFR1~NFR7), contract-summary.md(C1·C5).
> u1은 순수·결정론적 천문 계산 라이브러리다. produces_kinds상 library에 적용되는 NFR 산출물은 security-requirements, tech-stack-decisions, traceability뿐(performance/scalability/reliability/observability는 service·ui 전용이라 미적용).
> 대부분의 NFR은 전역 결정(NFR5 무료 범위, NFR6 비밀값 비하드코딩)에서 자명. 아래는 u1에 특유한 기술 선택·보안 공백만 묻는다.

## Q1. [아키텍트] 천문 계산 라이브러리 선택

u1의 핵심 기술 선택입니다. 달 조도·박명·월출몰을 계산할 오픈소스 라이브러리를 어떻게 정할까요? (C5 소비 경계, A3)

A. JS/TS 생태계의 무료·오픈소스 천문 계산 라이브러리를 쓴다(예: astronomy-engine 류 — 브라우저에서 동작, 의존성 가벼움, 키 불필요). 구체 패키지는 tech-stack-decisions에 1순위+대안으로 기록하고 code-generation에서 확정 (권장)
B. 직접 천문 공식을 구현(라이브러리 의존 없음)
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 언어·런타임

A. TypeScript로 작성(팀 코드 스타일 Prettier+ESLint, camelCase), 브라우저 런타임 대상 순수 함수 모듈. 빌드/테스트 러너는 프로젝트 공통 선택을 따름(code-generation 스캐폴딩에서 확정) (권장)
B. 다른 언어/런타임
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 보안 — 입력 검증 경계

u1은 비밀값·인증·외부 호출이 없는 순수 계산 라이브러리입니다. 보안 요구의 초점은?

A. 시스템 경계 입력 검증에 집중 — dateKstId 형식·lat/lon 범위·night 경계 쌍을 검증하고 유효하지 않으면 AstronomyComputationError로 전달(BR5.1). 비밀값 없음(NFR6 해당 없음), 네트워크 없음. 결정론적이라 주입·부작용 위험 낮음 (권장)
B. 추가 보안 고려사항이 있다 (자유 기술)
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 무료 범위(NFR5) 관련

A. u1은 런타임 외부 데이터 소스를 쓰지 않는다(천문 계산은 로컬·결정론적). 따라서 NFR5(무료 티어 범위)는 "오픈소스 라이브러리가 무료 라이선스인지"로만 적용되고, API 호출 한도 이슈는 u2 소관 (권장)
B. 다르게 보고 싶다
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
