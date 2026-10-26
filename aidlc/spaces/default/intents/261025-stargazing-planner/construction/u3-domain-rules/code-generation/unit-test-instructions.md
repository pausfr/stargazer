# Unit Test Instructions — u3-domain-rules

## 테스트 프레임워크 / 설정
- 러너: **Vitest**(U1·U2에서 구성한 루트 `vitest.config.ts` 재사용). 신규 의존성 없음.
- 커버리지: `@vitest/coverage-v8`(기설치).
- 테스트 파일: `src/domain-rules/__tests__/domain-rules.test.ts`.
- 방법론: **test-after** — 각 레이어 구현 직후 테스트 작성·실행.

## 이 단위의 테스트 실행 명령 (유닛 범위 한정)

```bash
npx vitest run src/domain-rules
```

커버리지 포함(핵심 모듈 플로어 측정, 경로 한정):

```bash
npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'
```

> 전역 `npm test`/`vitest run` 금지 — U3 테스트는 `src/domain-rules`로만 범위를 한정한다(project.md 학습).

## 기대 커버리지 목표
- `src/domain-rules`(핵심 판정 모듈) **라인 커버리지 ≥ 80%**(team.md Q4).
- 추천 3분기(recommended/not_recommended/deferred)와 공휴일 covered/outOfTable 분기를 전부 커버.

## 스텁/모킹 가이드
- 외부 네트워크 없음(순수). 모킹 대상은 없으며, **시각·기준일·입력을 주입**해 결정성을 확보한다(실시간 Date.now() 의존 금지).
- recommend 테스트는 AstronomyResult·CloudForecast를 직접 구성한 고정 객체로 넘긴다(U1·U2 실제 호출 불필요).
- 공휴일 테이블은 내장 상수이므로 커버 연도 범위 경계값(fromYear-1, toYear+1)을 케이스로.

## 테스트 데이터 관리
- 고정 기준일(예: 2026-10-26 KST)과 고정 좌표(대표 1점)를 상수로.
- 임계값 경계: 조도 정확히 20%, 구름 정확히 30%(둘 다 recommended 쪽).
- 컷오프/범위 경계: months=3(최소), 공휴일 연휴가 있는 범위와 없는 범위.

## 테스트 케이스 체크리스트 (약 20~26개)

**types**
- [ ] verdict/holidayCoverage enum 가드

**holidays (BR1.5)**
- [ ] 범위 내 공휴일 적중 / 대체공휴일
- [ ] 범위 내 비공휴일
- [ ] 범위 밖 연도 → outOfTable

**calendar / WF1 (BR1.1~1.4, SD1)**
- [ ] 3개월 범위 주말·공휴일 산출(날짜순)
- [ ] 공휴일 없을 때 주말만(BR1.2)
- [ ] 연휴 묶음 holidayGroupId·라벨(BR1.4)
- [ ] 밤 범위 nightStart/End(BR1.3)
- [ ] months<3 처리(검증 게이트)
- [ ] fromKstId 형식 오류 처리

**recommend / WF2 (BR2.1~2.6, SD1)**
- [ ] known 조도≤20%·구름≤30% → recommended
- [ ] known 조도≤20%·구름>30% → not_recommended
- [ ] known 조도>20% → not_recommended
- [ ] 경계값 조도=20·구름=30 → recommended
- [ ] outOfHorizon → 조도만 판정(cloudConsidered=false)
- [ ] unknown → deferred(reason 설정)
- [ ] known이나 밤 구간 구름 데이터 없음 → deferred
- [ ] 비정상 조도 + cloud.unknown → deferred 유지(분기 우선순위 보존)
