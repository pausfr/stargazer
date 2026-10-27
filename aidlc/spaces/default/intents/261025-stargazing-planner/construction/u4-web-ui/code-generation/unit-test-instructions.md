# Unit Test Instructions — u4-web-ui

## 테스트 프레임워크 / 설정
- 러너: **Vitest**(루트 `vitest.config.ts` 재사용). 신규 테스트 러너 도입 없음.
- 커버리지: `@vitest/coverage-v8`(기설치).
- DOM 필요 테스트: 파일 상단에 `// @vitest-environment happy-dom`로 한정(루트 기본 환경은 node 유지 — 핵심 계산 모듈 측정에 영향 없음). `happy-dom`을 devDependency로 추가(Step 1).
- 테스트 파일: `src/web-ui/__tests__/*.test.ts`.
- 방법론: **test-after** — 각 레이어 구현 직후 테스트 작성·실행.

## 이 단위의 테스트 실행 명령 (유닛 범위 한정)

```bash
npx vitest run src/web-ui
```

> 전역 `npm test`/`vitest run` 금지 — u4 테스트는 `src/web-ui`로만 범위를 한정한다(Build and Test가 단위별 명령을 각각 실행하므로).

## 기대 커버리지 목표
- **u4(UI)는 80% 라인 커버리지 플로어 대상이 아니다**(team.md Q4: 플로어는 핵심 계산 모듈 u1/u2/u3 전용). 이 값은 낮추는 것이 아니라 팀이 확정한 적용 범위를 따르는 것이다.
- 대신 **순수 로직에 테스트를 집중**한다: 상태 매핑(`state.ts`), 조립(`assembler.ts`), 추천 표시 매핑(`recommendationView.ts`), 표시 문구/요약 매핑. 이 순수 로직은 사실상 전 분기를 커버하는 것을 목표로 한다.
- 실제 DOM 렌더링·Chart.js 그리기·레이아웃은 **수동 스모크**로 보완한다(흔한 모바일 네트워크·다크모드·접근성 확인).

## 스텁/모킹 가이드
- U1(`computeAstronomy`)·U2(`getCloudForecast`)·U3(`listCandidateDates`·`recommend`)는 **mock/고정 객체**로 주입한다(실제 호출·네트워크 금지). assembler는 이 함수들을 주입받는 형태로 설계해 테스트 결정성을 확보한다.
- `nowMs`와 공유 `cache`를 명시 주입해 outOfHorizon 컷오프·캐시 동작을 결정적으로 만든다.
- 외부 날씨 API는 u4 테스트에서 절대 호출하지 않는다(U2 경계).

## 테스트 데이터 관리
- 고정 기준일(예: 2026-10-26 KST)·고정 좌표(`DEFAULT_LOCATION`) 상수.
- 경계 케이스: 월출/월몰·완전한 밤 경계가 `null`인 날(요약 "없음"), 날씨 `known`/`outOfHorizon`/`unknown` 각각, 천문 throw.

## 테스트 케이스 체크리스트 (약 14~20개)

**types / 상태 매핑 (`state.ts`, FR6.1~6.3·§5·SD3)**
- [ ] 천문 OK + 날씨 known → `ok`
- [ ] 천문 OK + 날씨 unknown → `partial`(중립 문구 "구름량 알 수 없음")
- [ ] 천문 OK + 날씨 outOfHorizon → `ok`(+"먼 날짜" 안내)
- [ ] 천문 throw → `error`
- [ ] 내부 사유(C2 `reason`·error `code`)가 표시 문자열에 포함되지 않음(SD3)

**조립 (`assembler.ts`, PD1·PD3·§2.1)**
- [ ] 즉시 단계에서 천문을 먼저 산출(날씨 대기 전)
- [ ] known/unknown/outOfHorizon/throw 경로별 state·verdict 결과
- [ ] `computeAstronomy`에 nightStartKst/nightEndKst 전달 확인(§2.1)
- [ ] 동일 `cache`·`nowMs` 주입 재사용(재방문 캐시 히트 경로)

**추천 표시 매핑 (`recommendationView.ts`, FR2.1·AC2.1.4)**
- [ ] recommended → 노란 테두리 + 별 아이콘 + "추천" 라벨(색 비의존, 아이콘/라벨 병행)
- [ ] not_recommended → 강조 없음
- [ ] deferred → 강조 없음(목록에서 제외하지 않음)

**표시 문구/요약 (happy-dom, FR3.4·FR6.1)**
- [ ] 월출/월몰·완전한 밤 경계 null → "없음" 표기
- [ ] partial 상태 → 구름만 "구름량 알 수 없음", 나머지 표시
- [ ] 재시도(WF3) 상태 전이: error → 재시도 → ok/partial 또는 error 유지

> 참고: 실제 Chart.js 인스턴스 그리기·annotation 음영 렌더는 단위 테스트에서 제외하고 수동 스모크로 확인한다(team.md: UI 렌더링은 플로어 비대상).
