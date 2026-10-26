# Unit Test Instructions — u2-weather-data

## 테스트 프레임워크 / 설정

- 러너: **Vitest**(U1에서 구성한 루트 `vitest.config.ts` 재사용). 신규 의존성 없음.
- 커버리지: `@vitest/coverage-v8`(U1에서 설치됨).
- 테스트 파일 위치: `src/weather/__tests__/weather.test.ts`.
- 방법론: **test-after** — 각 레이어 구현 직후 그 레이어 테스트 작성·실행.

## 이 단위의 테스트 실행 명령 (유닛 범위 한정)

```bash
npx vitest run src/weather
```

커버리지 포함:

```bash
npx vitest run src/weather --coverage
```

> 첫 테스트 작성 전 러너 실행 가능 확인용으로도 위 명령을 사용(U1 설정 재사용이라 빈 디렉터리에서도 즉시 실행 가능). 프로젝트 전역 `npm test`/`vitest run`은 금지 — U2 테스트는 `src/weather` 경로로만 범위를 한정한다.

## 기대 커버리지 목표

- `src/weather`(핵심 데이터/계산 모듈) **라인 커버리지 ≥ 80%**(team.md Q4 플로어).
- 상태 정규화 3분기(known/outOfHorizon/unknown)와 캐시 TTL 분기는 전부 커버.

## 외부 의존성 스텁/모킹 가이드 (중요 — U1과 다름)

- **실제 네트워크를 호출하지 않는다(Q3 결정).** `WeatherClient`/`getCloudForecast`에 `fetch` 함수를 주입(dependency injection)하고, 테스트는 페이크 `fetch`를 넘긴다.
  - 성공 케이스: 구름량 필드가 든 Open-Meteo 형태의 JSON을 돌려주는 페이크 `fetch`.
  - 실패 케이스: HTTP 오류 상태, 거부(reject), 타임아웃(AbortController가 abort되도록), 파싱 불가 본문, 구름량 필드 결측 각각을 페이크로 재현.
- **시각은 주입 가능한 `nowMs`로 고정**해 "오늘+14일" 컷오프와 TTL 만료를 결정적으로 테스트(실시간 `Date.now()` 의존 금지).
- 타임아웃 테스트는 짧은 타임아웃 값 + 응답을 지연시키는 페이크로 `AbortController` 경로를 탄다.

## 테스트 데이터 관리

- 고정 좌표(전국 대표 1점, 예: lat 36.5, lon 127.8)와 고정 `nowMs` 기준 날짜를 상수로 둔다.
- 컷오프 경계값: 오늘+14일(=known 경계), 오늘+15일(=outOfHorizon)을 각각 케이스로.

## 테스트 케이스 체크리스트 (약 18~24개)

**types (상태 불변식)**
- [ ] knownForecast → hourlyCloudPct 채움, reason=null
- [ ] outOfHorizonForecast → hourlyCloudPct=null, reason=null
- [ ] unknownForecast → hourlyCloudPct=null, reason 존재

**validation (SD1)**
- [ ] 유효 입력 통과
- [ ] 잘못된 날짜 형식 실패
- [ ] 비실재 날짜(2026-02-30 등) 실패
- [ ] lat 범위 밖 실패 / lon 범위 밖 실패

**cache (BR3.1)**
- [ ] 저장 후 TTL 이내 → 히트
- [ ] TTL 초과 → 미스
- [ ] unknown 짧은 TTL vs known 긴 TTL 차등 만료
- [ ] cacheKey가 날짜·좌표를 구분

**client (BR2.1·BR2.2·BR4.1) — 스텁 fetch**
- [ ] 성공+구름량 → known
- [ ] HTTP 오류 → unknown
- [ ] 타임아웃(abort) → unknown
- [ ] 파싱 불가 본문 → unknown
- [ ] 구름량 결측 → unknown
- [ ] 외부 원형 응답/오류가 반환값에 누출되지 않음

**weather / WF1 (BR1.1·BR1.2·BR3.1·BR3.2)**
- [ ] 유효 캐시 → 호출 없이 반환
- [ ] 오늘+15일 → outOfHorizon(fetch 미호출 단언)
- [ ] 오늘+14일 이내 성공 → known
- [ ] 14일 이내 실패 → unknown
- [ ] 잘못된 입력 → unknown(호출 안 함)
- [ ] unknown 후 TTL 만료 재진입 → 재호출(WF2, 자동 재시도 없음 확인)
