# Code Summary — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 구름량 예보 데이터 접근 라이브러리. 승인된 code-generation-plan.md 15단계를 test-after로 구현.

## 생성/수정 파일

### 생성 (워크스페이스 루트 `src/weather/`)
- `src/weather/types.ts` — 공개 타입(CloudStatus·HourlyCloud·CloudForecast·CloudForecastQuery·CacheEntry), 상태 불변식 생성 헬퍼(knownForecast/outOfHorizonForecast/unknownForecast), `FORECAST_HORIZON_DAYS = 14` 단일 상수(BR1.3 불변식 주석).
- `src/weather/validation.ts` — SD1 진입점 검증 게이트 `isValidQuery`(예외 없이 불리언, C2 throws:never 정합). dateKstId 형식·실재 날짜, lat∈[-90,90], lon∈[-180,180].
- `src/weather/cache.ts` — `DataCache`(메모리 Map, get/set with 주입 nowMs), `cacheKey`, `ttlForForecast`, `LONG_TTL_MS`(60분)/`SHORT_TTL_MS`(2분).
- `src/weather/client.ts` — `WeatherClient`(Open-Meteo 키 불필요 호출, fetch+AbortController 타임아웃, fetch 주입 가능). 응답 비신뢰 경계 파싱 후에만 known; 실패/타임아웃/파싱불가/구름량 결측→unknown(내부 reason). 외부 원형 응답·오류 비노출.
- `src/weather/weather.ts` — WF1 `getCloudForecast`(검증→캐시→14일 컷오프→호출→TTL 캐시). 자동 재시도 없음(BR3.2). nowMs·cache·client·fetch 주입.
- `src/weather/index.ts` — 공개 API 재노출(getCloudForecast, 타입들, DataCache, FORECAST_HORIZON_DAYS). 외부 원형 타입 비노출.

### 테스트 (`src/weather/__tests__/`)
- `types.test.ts`(4), `validation.test.ts`(7), `cache.test.ts`(7), `client.test.ts`(6), `weather.test.ts`(8) — 합계 32개.
- 레이어별 5파일 분리는 승인 계획의 단일 `weather.test.ts`(18~24개) 명시에서 개선한 편차(기능·범위는 더 충실). 리뷰 Minor #2 반영.

### 재사용 (U1에서 생성, 신규 의존성 없음)
- 루트 `package.json`·`tsconfig.json`·`vitest.config.ts`·`.prettierrc.json`·`eslint.config.js`.

## 핵심 구현 결정
- **3-상태 정규화(BR2.2)**: 외부 응답/실패를 어댑터(`WeatherClient`)가 known/outOfHorizon/unknown으로만 정규화. 호출부는 C2 CloudForecast만 봄. 상태 불변식(known→reason=null, outOfHorizon→둘 다 null, unknown→hourly=null+reason)은 생성 헬퍼로 강제.
- **14일 사전 컷오프(BR1.1·BR1.3)**: 요청일 > 오늘KST+14일이면 외부 호출 없이 outOfHorizon. 컷오프 비교는 KST epoch-day 인덱스 차로 결정적 수행. BR1.3 불변식(14 ≤ Open-Meteo 16일 범위)으로 outOfHorizon과 unknown 비중첩 보장.
- **입력 검증(SD1)**: 진입점에서 fail-fast, 예외 대신 불리언. 실패 시 호출 없이 unknown(reason="invalid input").
- **복원력(BR3.1·BR3.2·BR4.1)**: TTL 캐시(known/outOfHorizon 60분, unknown 2분), 단일 호출·자동 재시도 없음, fetch 타임아웃(5초). unknown 짧은 TTL이 사용자 재진입 시 재호출을 성립.
- **비밀값 없음(SD3, NFR6.1)**: 키 불필요 Open-Meteo. 환경변수·시크릿 불필요.
- **테스트 결정성**: nowMs·fetch 주입으로 실시간/네트워크 비의존(Q3 결정: 외부 API 실제 호출 안 함).

## 테스트 커버리지 요약
- 32개 테스트 전부 통과(5개 파일).
- `src/weather` 라인 커버리지 **93.64%**(80% 핵심 모듈 플로어 충족). cache/validation 100%, weather.ts 라인 100%, client.ts 87.01%, index.ts는 재노출만.
- `npx tsc --noEmit` 통과(strict). `npx eslint src/weather` 0 errors/warnings.

## 이 단계에서 실행되지 않은 테스트
- 없음. 모든 단위 테스트가 이 단계에서 실행·통과됨. CI 실행은 CI Pipeline 단계(이 단위 Bolt에서 아직 미실행)에서 수행 예정.
- 실제 Open-Meteo 네트워크 통합 스모크는 수동 스모크(team.md: UI·외부 API 연동은 수동 스모크)로 보완 예정 — 이 단계에서는 실행 안 함(의도적, Q3).

## 계획과의 편차
1. 유닛 커버리지 측정 명령을 `--coverage.include='src/weather/**'`로 경로 한정(루트 v8 집계가 .kiro 툴링까지 포함해 핵심 모듈 플로어를 희석하는 문제 회피). 기능·테스트 범위 동일, 측정 방식만 명시. (diary Deviations 기록)
2. BR1.3 불변식을 Open-Meteo 16일 범위 기준으로 확정하고 상수 주석에 근거 기록. (diary Interpretations 기록)
3. 테스트를 계획의 단일 `weather.test.ts`(18~24개) 대신 레이어별 5파일·32개로 분리(개선 방향). 리뷰 Minor #2 반영.
4. 리뷰 Minor #1 수정 반영: outOfHorizon 결과의 캐시 TTL을 "긴 TTL과 다음 KST 자정까지 중 짧은 쪽"으로 제한해, 자정 교차 시 지평 경계 날짜가 stale outOfHorizon을 반환하던 엣지를 제거(`weather.ts`, 전용 테스트 1개 추가). Minor #3(index.ts의 TTL 상수 비노출)은 의도된 공개 표면으로 현행 유지.
