# Security Design — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library). 근거: nfr-requirements(security-requirements NFR6.1~6.3·NFR3.1·NFR4.1·NFR5.1·NFR-U3-MAINT.1), functional-spec(WF1·WF2), rules(BR1.5·BR2.3·BR2.4), contract-summary(C1·C2·C3), nfr-design-questions.md(Q1). 설계 수준(패턴)만; 구현 코드는 code-generation.
> U3는 네트워크·비밀값·저장이 없는 순수 규칙 라이브러리다. 보안 설계는 입력 검증 게이트·순수성·상수 격리에 집중한다. 외부 신뢰 경계 없음.

## 보안 설계 결정

### SD1. 진입점 입력 검증 게이트 (NFR6.2)
- **패턴**: 공개 함수 진입점(listCandidateDates, recommend)에서 단일 검증 게이트(fail-fast). C2는 `throws: never`를 명시하고, C3(listCandidateDates·recommend)는 throws를 선언하지 않는 동기 함수다 — 어느 쪽도 예외를 던지지 않는 설계와 정합하게, 검증 실패를 안전한 기본값/결과로 처리한다.
  - listCandidateDates(range): fromKstId 형식(YYYY-MM-DD·실재 날짜), months ≥ 3 검증. 불충족이면 빈 목록 또는 months를 3으로 보정(구현에서 확정).
  - recommend(astro, cloud): moonIlluminationPct 범위(0~100), cloud.status enum 유효성을 신뢰하되 방어적으로 확인. **분기 우선순위(BR2.4 보존)**: cloud.status 분기(unknown→deferred, outOfHorizon→조도만)를 먼저 적용하고, 그다음에만 조도 비정상 보정을 한다. 즉 cloud.status=unknown이면 조도 비정상 여부와 무관하게 deferred를 유지해, deferred가 not_recommended로 조용히 뒤집히지 않게 한다. 밤 구간 구름 데이터 없음도 deferred(BR2.4).
- **근거**: NFR6.2, 구성 가드레일(경계 입력 검증). 조용히 실패하지 않는다.

### SD2. 순수성·결정론 경계 (NFR6.3, NFR4.1)
- **패턴**: U3 공개 함수는 순수 함수다. 네트워크·파일·전역 가변 상태 접근 없음, 동일 입력 → 동일 출력. 참고: 현재 C3 진입점(listCandidateDates는 DateRange.fromKstId를 명시 입력으로 받고, recommend는 astro/cloud만 받음)에는 "오늘" 파생 시각 의존이 없다. 향후 "오늘 기준" 파생이 생기면 그 시각 의존은 입력/주입(nowMs 또는 기준일)으로 받아 결정성을 유지한다(결정성 원칙의 예시).
- **실패 격리**: U2가 unknown을 반환해도 U3는 deferred로 격리(BR2.4)해 앱을 멈추지 않는다. U3 자체는 외부 의존이 없어 네트워크 장애 영향 없음(NFR4.1 간접 기여).
- **근거**: NFR6.3, NFR4.1.

### SD3. 상수 격리 (NFR-U3-MAINT.1, BR2.5)
- **패턴**: 정책성 수치를 단일 상수 모듈로 분리해 계산 로직과 섞지 않는다(ADR-002).
  - 추천 임계값: MOON_ILLUMINATION_MAX_PCT=20, CLOUD_MAX_PCT=30.
  - 공휴일 테이블 커버 연도 범위(fromYear·toYear) — 범위 밖은 주말만 안전 처리(BR1.5), 테스트로 보장.
  - 밤 구간 구름량 집계 방식(평균/대표값) — code-generation에서 확정하되 상수/정책으로 노출.
- **근거**: NFR-U3-MAINT.1, BR2.5.

## 복원력 설계 — 순수 규칙 라이브러리 규모에 맞춤

| 패턴 | 설계 | 근거 |
|------|------|------|
| 실패 격리 | U2 unknown → deferred, 조도 비정상 → 보수적 판정. u3는 던지지 않음. | BR2.4, NFR6.3 |
| 선형 복잡도 | 날짜 순회·추천 판정이 후보 밤 수 N에 O(N). UI 비차단. | NFR3.1 |
| 외부 의존 없음 | 네트워크·저장·키 없음 → 장애 표면 최소. | NFR5.1, NFR6.1 |

서킷 브레이커·재시도 등 무거운 패턴은 외부 호출이 없는 U3에 해당 없음.

## 위협 모델 (요약)

| 위협 | u3 노출 | 완화 |
|------|---------|------|
| 입력 조작 | DateRange·좌표 없는 입력 | SD1 검증 게이트 |
| 오염된 상류 결과 | U1·U2 결과 | SD1 방어적 확인(신뢰하되 보수적 판정) |
| 비밀값 유출 | 없음(키·네트워크 없음) | SD3 외부 의존 없음 |
| 상태 오염·비결정성 | 전역 상태·시각 의존 | SD2 순수성·시각 주입 |
| 공휴일 테이블 노후 | 범위 밖 연도 | BR1.5 범위 밖 주말만, 테스트 보장 |

## Sources

- security-requirements.md(NFR6.1~6.3·NFR3.1·NFR4.1·NFR5.1·NFR-U3-MAINT.1), rules.md(BR1.5·BR2.3·BR2.4·BR2.5), tech-stack-decisions.md, contract-summary.md(C1·C2·C3), functional-spec.md(WF1·WF2).

## Assumptions & Open Questions

- 입력 검증 실패의 구체 처리 형태(빈 목록 vs months 보정), 밤 구간 구름 집계 방식은 code-generation에서 확정한다. [assumption]
