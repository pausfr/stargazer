# Cross-Unit Traceability — stargazing-planner (Build and Test Step 10)

> `aidlc engine sensor-traceability --stage build-and-test` 결과 기반. 전 요구·수용기준이
> 빌드된 파일로 추적되거나 사유와 함께 N/A로 표기됨.

## 판정: **PASS** (uncovered 없음)

4개 단위(u1-astronomy, u2-weather-data, u3-domain-rules, u4-web-ui)가 상류 FR·NFR·AC를
빠짐없이 커버한다. 미적용 상류 NFR은 소유 단위에서 사유와 함께 N/A로 둔다.

## 커버리지 요약(단위·파일)

**기능 요구(FR)**
- FR1.1~1.4: u4 listView.ts / assembler.ts
- FR2.1: u4 recommendationView.ts. FR2.2~2.4: u3 recommend.ts(AC2.1.1~2.1.4 경유)
- FR3.1·3.6: u4 detailView.ts. FR3.2·3.3·3.5: u4 chart.ts. FR3.4: u4 summaryView.ts
- FR4.1·4.2: u1 astronomy.ts(천문 계산, AC3.1.x·3.2.x 경유)
- FR5.1~5.3: u2 weather.ts / cache.ts / client.ts(AC1.3.x·3.1.x·4.1.x 경유)
- FR6.1·6.3: u4 state.ts. FR6.2: u4 detailView.ts(안전 렌더)

**비기능 요구(NFR)**
- NFR1·NFR2: u4 styles.css(다크·색 비의존·반응형)
- NFR3(체감 로딩): u4 listView/assembler/app/chart(스켈레톤·병렬·점진·공유 캐시·단일 차트).
  u3는 순수 규칙 라이브러리라 NFR3.1 N/A(사유 기록, 소관 아님)
- NFR4(가용성): u2 weather.ts(실패→unknown 격리). u3 NFR4.1 N/A
- NFR5(무료 한도): u2 cache.ts(캐시·컷오프·단일 호출). u3 NFR5.1 N/A
- NFR6(보안): u1·u2·u4 전반(비밀값 없음·입력 검증·내부 사유 비노출·안전 렌더).
  u3 NFR6.3 N/A(외부 비신뢰 응답 비취급)
- NFR7(정적 호스팅): u4 vite.config.ts(정적 번들)

**수용기준(AC)**: AC1.1.1~1.1.3·1.2.1·1.2.2·1.3.1~1.3.3, AC2.1.1~2.1.4,
AC3.1.1~3.1.3·3.2.1~3.2.3·3.3.1~3.3.2, AC4.1.1~4.1.3·4.2.1~4.2.2 전부 커버
(u1/u2/u3/u4 분담).

## 소유 단위/파일 매핑 바로잡음(이 단계에서 정정한 추적 산출물)

- u2·u3 `traceability.json`: 상류 식별자 배열(`upstream_ids`)이 없던 스키마를
  표준 스키마(`upstream_ids` + `coverage[].target`)로 정정. 기능 변경 없음, 추적 표기만.
- u4 `traceability.json`: `target`에 괄호 주석이 섞여 파일 경로 파싱이 깨지던 것을
  순수 파일 경로로 정정(수정 설명은 `fixes` 섹션으로 이동). 실제 빌드된 파일과 일치.
- 실제로 빌드됐으나 미매핑이던 AC1.2.2("표시할 날짜 없음" 빈 상태, listView.ts)·
  AC3.2.2(범례 설명, detailView.ts)를 u4 커버리지에 추가.
- u2/u3의 미적용 상류 NFR(순수 라이브러리 관심사 아님)을 사유와 함께 N/A로 표기.

## 미해결 항목

없음(uncovered 0). 의도적으로 열어 둔 천문 이벤트 비교(은하수·행성·유성우·별자리)는
요구에 포함되지 않은 "열린 항목"이라 추적 대상 FR/AC가 아니다(intent-capture 학습).
