# Practices Discovery — Questions (개발 관행 확인)

> 개인·1인 프로젝트에 맞춘 관행 확인입니다. 기본값(흔한 합리적 선택)을 제안으로 두었으니, 맞으면 그대로 고르시면 됩니다.

## Q1. [작업 방식] 브랜치·커밋 방식

혼자 개발하니 보통 main 하나에 바로 작업하고 합치는 방식(트렁크 기반)이 간단합니다. 어떻게 할까요?

A. main 하나로 단순하게 (제안)
B. 기능별 브랜치를 만들어 PR로 합치기
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]:A

## Q2. [작업 방식] 얇은 end-to-end 조각을 먼저 만들까요?

"워킹 스켈레톤"은 처음부터 전체를 관통하는 최소 버전(예: 연휴 하나 → 천문 계산 → 그래프 한 장까지 실제로 동작)을 먼저 만들어 조각들이 연결되는지 확인하는 방식입니다. 그렇게 할까요?

A. 네 — 얇게 끝까지 한 번 관통시키고 시작 (제안)
B. 아니요 — 그냥 화면/기능 단위로 쌓아감
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]:C

## Q3. [테스트] 테스트 방식·분량

천문 계산(달 조도·박명·월출몰·추천 점수)은 정답이 분명해 테스트 가치가 큽니다. 어느 수준으로 할까요?

A. 테스트 후행(코드 먼저, 그 다음 테스트) + 핵심 계산 로직은 happy-path와 경계값까지 (제안)
B. 테스트 주도(TDD) — 테스트 먼저
C. 가볍게 — 핵심 계산만 최소한으로
D. 상관없음 — 알아서
X. Other (please specify)

[Answer]:C

## Q4. [테스트] 커버리지 기준

feature 범위 기본은 "80% 라인 커버리지 + 머지 전 CI 실행"입니다. 개인 프로젝트인데 어떻게 할까요?

A. 80% 기준은 핵심 계산 모듈에만 적용, 나머지(UI 등)는 느슨하게 (제안)
B. 전체 80% 기준 그대로
C. 커버리지 수치 기준 없이 "핵심 계산은 꼭 테스트" 정도만
D. 상관없음 — 알아서
X. Other (please specify)

[Answer]:A

## Q5. [배포] 배포 방식

무료 정적 호스팅(GitHub Pages/Vercel/Netlify)에 올립니다. 배포는 어떻게?

A. main에 합치면 자동 배포(별도 운영 승인 게이트 없음) (제안)
B. 수동으로 내가 배포 트리거
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]:C

## Q6. [코드 스타일] 포매터·린터

JS/TS 기준 Prettier + ESLint 같은 표준 설정에 맡기는 걸 제안합니다. 특별히 원하는 규칙이 있나요?

A. 표준 설정(Prettier + ESLint)에 맡김 (제안)
B. 특정 규칙 선호가 있음 (Other에 적어주세요)
C. 상관없음 — 알아서
X. Other (please specify)

[Answer]:A

## Q7. [제약] 지켜야 할 하드 제약

반드시 지킬 선이 있나요? (해당되는 것 모두)

A. 모든 데이터 소스는 무료 범위 안에서만 (ALWAYS)
B. API 키 등 비밀값을 클라이언트 번들에 하드코딩하지 않기 (NEVER)
C. 둘 다
D. 특별히 없음
X. Other (please specify)

[Answer]:C

## Assumptions & Open Questions

None.

## Consolidated Summary Confirmation

- 작업 방식: 트렁크 기반, main 하나로 단순하게.
- 워킹 스켈레톤: 특정 선택 없이 맡김 → feature 스코프 기본값에 따라 처리(스코프의 skeleton 설정이 결정).
- 테스트: 테스트 후행(코드 먼저, 그 다음 테스트), 가볍게 — 핵심 천문 계산 로직 위주.
- 커버리지: 80% 라인 커버리지는 핵심 계산 모듈에만 적용, UI 등 나머지는 느슨하게.
- 배포: main 머지 시 자동 배포(무료 정적 호스팅), 별도 운영 승인 게이트 없음.
- 코드 스타일: Prettier + ESLint 표준 설정에 맡김.
- 하드 제약: ALWAYS 모든 데이터 소스를 무료 범위 안에서; NEVER API 키 등 비밀값을 클라이언트 번들에 하드코딩.

- Looks correct
- Request changes

[Answer]: Looks correct
