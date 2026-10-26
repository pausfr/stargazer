## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-26T15:02:54Z
**Iteration:** 1
**Verdict Dictated:** no

적대적으로 설계(C2·C4·BR1.1~BR4.1·SD1~SD3·NFR6)와 생성 코드·테스트를
대조하고, 계약 위반·경계 오프바이원·숨은 결함·silent failure를 찾으려
시도했다. 아래 검증 근거(명령 실행 결과 포함)로 계약 위반·치명 결함은
발견하지 못했으며, 세 건의 Minor만 남는다. 따라서 판정은 READY다.

### 검증한 핵심 사항 (근거)

- **C2 3-상태·불변식**: `knownForecast`/`outOfHorizonForecast`/`unknownForecast`
  생성 헬퍼가 불변식(known→reason=null·hourly 채움, outOfHorizon→둘 다 null,
  unknown→hourly=null·reason 존재)을 강제한다(`types.ts`). `parseHourlyCloud`가
  빈 배열을 null로 처리하므로 `knownForecast`가 빈 hourly로 호출되는 경로는
  없다(`client.ts`). `types.test.ts` 4개가 세 불변식을 직접 검증, 통과.
- **C2 throws:never**: `isValidQuery`는 불리언 반환(예외 없음), `client`의
  모든 실패 경로는 try/catch로 감싸 `unknownForecast`를 반환, `weather.ts`
  진입점도 예외를 던지지 않는다. `validation.test.ts`의 null/undefined 입력도
  예외 없이 false. 계약 정합.
- **BR1.1 컷오프 경계(오프바이원)**: `isBeyondHorizon`은
  `requestDay - todayKstDay > FORECAST_HORIZON_DAYS(=14)`. 즉 오늘+14는 범위
  안(known 경계), 오늘+15는 범위 밖(outOfHorizon). BR1.1 문구("오늘+14일을
  넘으면")와 정확히 일치. `weather.test.ts`가 오늘+14→known(호출 1회),
  오늘+15→outOfHorizon(호출 0회)를 스파이로 단언, 통과. 오프바이원 없음.
- **KST epoch-day 비교**: `todayKstDay`는 `(nowMs+KST_OFFSET)/ONE_DAY` 바닥값,
  `requestDay`는 `Date.UTC(y,m-1,d)/ONE_DAY` 바닥값으로 둘 다 "날짜의 day
  인덱스"라 단위가 일치하고 시각 세부에 흔들리지 않는다. 결정적.
- **BR1.3 비중첩 불변식**: `FORECAST_HORIZON_DAYS=14 ≤ Open-Meteo 16일`을
  상수 주석과 `types.test.ts`가 명시. 14일 이내 결측/실패는 unknown으로만,
  초과는 outOfHorizon으로만 가므로 두 상태가 코드상 겹치지 않는다.
- **BR2.1·BR2.2 비신뢰 경계**: `parseHourlyCloud`가 payload/hourly/배열 타입·
  길이 일치·원소 타입을 보수적으로 검사(한 원소라도 불량이면 전체 결측).
  HTTP 오류·reject·abort·json 예외·결측을 모두 unknown으로 정규화하고 내부
  reason만 기록한다. 외부 원형 응답/오류 객체는 반환값에 실리지 않는다
  (`client.test.ts` 6개가 각 경로 커버, 통과). `index.ts`는 `FetchLike`·
  raw payload 타입을 재노출하지 않아 어댑터 경계가 모듈 경계에서도 유지된다.
- **BR3.1·BR3.2 TTL·재시도 없음**: `ttlForForecast`가 unknown→SHORT(2분),
  그 외→LONG(60분). `weather.ts`는 자동 재시도 없이 결과 타입으로 전달;
  unknown 짧은 TTL 만료 후 재진입 시 재호출됨을 `weather.test.ts`가 단언(통과).
- **SD1·SD3·NFR6**: 진입점 검증 게이트 존재, 실패 시 외부 호출 없이
  unknown(reason="invalid input")(`weather.test.ts`가 fetch 0회 단언). 비밀값/
  키 문자열 없음(`grep` 결과 무매치, 키 불필요 Open-Meteo 공개 API). silent
  failure 없음(모든 실패가 unknown+reason로 표면화).
- **테스트 품질·커버리지**: `npx vitest run src/weather --coverage
  --coverage.include='src/weather/**'` → 31개 전부 통과, 라인 93.41%
  (핵심 모듈 ≥80% 플로어 충족). 무의미(항상 통과) 테스트 없음 — fetch 호출
  횟수 스파이·상태·reason·캐시 만료를 실제로 단언한다. 실제 네트워크 미호출
  (주입 fetch), nowMs 주입으로 결정적.
- **traceability.json**: 18개 엔트리의 OK 타깃 파일이 전부 실재
  (11개 소스/테스트 파일 존재 확인). 누락된 BR/AC 없음.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | src/weather/cache.ts > cacheKey / src/weather/weather.ts > getCloudForecast 캐시 저장 | 캐시 키가 날짜·좌표만 쓰고 "오늘(nowMs)"을 담지 않는다. 그래서 자정 직전에 조회해 outOfHorizon(60분 긴 TTL)로 캐시된 날짜가, 자정을 넘겨 "오늘+14일"로 들어온 뒤에도 TTL 만료 전까지 stale한 outOfHorizon을 돌려준다. 재현: nowMs=2026-11-17 23:50 KST에서 2026-12-02 조회→outOfHorizon 캐시, 40분 뒤(2026-11-18 00:30 KST) 같은 날짜 재조회해도 outOfHorizon·fetch 0회로 관측됨(프로브 테스트로 확인). 지평 경계 근방 날짜를 비교할 때 가까워진 날짜의 구름량이 최대 TTL만큼 늦게 나타날 수 있다. | outOfHorizon 결과의 TTL을 "자정까지 남은 시간"으로 제한하거나, 캐시 키/엔트리에 컷오프 판정의 기준일(today day 인덱스)을 포함해 날짜 경계가 바뀌면 미스가 되도록 하라. 개인용 정적 앱 규모에서 영향은 작으나(재진입·재오픈으로 자연 해소) 문서화해 두는 것이 안전하다. | New |
| R-02 | Minor | aidlc/.../u2-weather-data/code-generation/code-generation-plan.md > Summary / Step 4·15 | 계획은 테스트를 단일 파일 `src/weather/__tests__/weather.test.ts`(약 18~24개)로 명시했으나, 실제 산출물은 파일 5개(types/validation/cache/client/weather.test.ts), 31개다. 기능·범위는 오히려 더 충실하지만, 승인된 계획의 산출 경로/개수와 실제가 불일치한다. code-summary.md에는 5파일·31개로 올바르게 기재되어 계획 쪽만 갱신되지 않았다. | 경미한 계획-산출 드리프트. 테스트를 레이어별로 분리한 편차(개선 방향)를 계획 또는 편차 노트에 한 줄로 반영해 계획과 산출의 추적을 일치시켜라(기능 변경 불필요). | New |
| R-03 | Minor | src/weather/index.ts | 공개 인덱스가 `CacheEntry` 타입과 TTL 상수(`LONG_TTL_MS`/`SHORT_TTL_MS`)·`cacheKey`·`ttlForForecast`를 재노출하지 않는다. 계획 Step 13은 "DataCache 재노출"만 요구하므로 계약 위반은 아니고, 호출부(U3·U4)는 `getCloudForecast`만 쓰면 되어 현재 설계와 정합한다. 다만 `DataCache`를 공개하면서 그 TTL 정책 상수를 비노출로 둔 것은 공개 표면이 다소 어정쩡하다(세션 캐시를 외부에서 생성·주입하는 호출부가 TTL을 조절할 여지가 없음). | 의도대로라면 현행 유지로 충분하다. 호출부가 캐시 수명을 조절할 필요가 생기면 TTL 상수를 선택적으로 재노출할지 code-summary의 공개 표면 설명에 한 줄 명확화하라. 비차단. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| npx vitest run src/weather --coverage (include=src/weather/**) | PASS: 31 tests / 5 files, 라인 93.41%, 브랜치 82.19% | 핵심 모듈 ≥80% 플로어 충족. 3-상태·TTL·컷오프·검증 경로 전부 커버. 실제 통과 확인. |
| npx tsc --noEmit | PASS (exit 0) | strict 타입 오류 없음. 계약 타입 정합. |
| npx eslint src/weather | PASS (exit 0, 0 errors/warnings) | 코드 스타일/린트 위반 없음. |
| grep (api key/secret/token/bearer) in src/weather | 무매치 | 비밀값·키 하드코딩 없음(NFR6.1·SD3·project.md Forbidden 정합). |
| 파일 실재 확인 (traceability OK 타깃 11종) | 전부 존재 | traceability.json의 OK 타깃이 실재 파일. 누락 AC/BR 없음. |

### Summary

C2 계약(3-상태·불변식·throws:never), BR1.1~BR4.1, SD1~SD3·NFR6이 코드와
테스트에 충실히 구현되었고, 테스트·타입체크·린트가 모두 실제로 통과한다.
치명·중대 결함은 없다. 남는 것은 지평 경계 근방의 자정 교차 stale 캐시
(Minor, 재현 확인), 계획과 테스트 파일 구조의 경미한 드리프트(Minor),
공개 표면의 TTL 상수 비노출(Minor)뿐이며 어느 것도 READY를 막지 않는다.
