# Security & NFR Requirements — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library): 달력 산출 + 추천 판정. 근거: requirements.md(NFR1·NFR4·NFR5·NFR6), functional-spec.md·rules.md(U3), contract-summary.md(C1·C2·C3), nfr-requirements-questions.md(Q1~Q3). U3는 네트워크·비밀값·저장이 없는 순수 규칙 라이브러리이므로 보안은 입력 검증·순수성에 초점.

## 보안 요구

### NFR6.1 — 비밀값 없음
- U3는 외부 호출·키·토큰을 쓰지 않는다. 비밀값을 보유·하드코딩하지 않는다(project.md Forbidden). 외부 신뢰 경계 없음.

### NFR6.2 — 입력 검증(진입점)
- `listCandidateDates(range)`: DateRange의 fromKstId 형식(YYYY-MM-DD·실재 날짜), months ≥ 3을 검증한다. 유효하지 않으면 빈 결과 또는 명확한 거부(예외 없이 결과로)로 처리.
- `recommend(astro, cloud)`: 입력 AstronomyResult(C1)·CloudForecast(C2)의 형태를 신뢰하되, 판정에 쓰는 값(moonIlluminationPct 범위 0~100, cloud.status enum, hourlyCloudPct 유무)이 예상 밖이면 안전하게 처리한다(조도 결측 등은 보수적으로 deferred/not_recommended로). 외부(U1·U2) 경계는 이미 각 단위가 방어하므로 U3는 "신뢰하되 방어적으로"를 적용.

### NFR6.3 — 순수성·결정론(부작용 없음)
- U3의 공개 함수는 순수 함수다: 동일 입력 → 동일 출력, 네트워크·파일·전역 상태 변경 없음. 시각 의존이 필요한 부분(오늘 기준 날짜 산출)은 입력/주입으로 받아 결정성을 확보한다. 조용히 실패하지 않는다(구성 가드레일).

## 성능·신뢰성 NFR

### NFR3.1 — UI 비차단·선형 복잡도 (성능)
- 3개월+ 범위의 날짜 순회(listCandidateDates)와 밤별 추천 판정(recommend)은 후보 밤 수(수십~수백)에 선형(O(N))이며, 동기 계산이 체감 지연 없이 완료되어 UI 렌더링을 막지 않는다. 엄격한 정량 SLO는 두지 않는다(NFR3·Q2). 선형 복잡도는 코드리뷰/테스트로 검증한다.

### NFR4.1 — 결정론적 가용성 (가용성 모델, 간접)
- NFR4(온라인 전제·오프라인 전용 미지원)는 주로 U2(fetch)·U4(렌더링) 소관이다. U3는 네트워크 전제가 없는 순수 라이브러리라 NFR4에 **간접적으로만** 닿는다: 외부 의존이 없어 네트워크 장애에 영향받지 않으며, U2가 unknown을 반환해도 U3는 deferred로 격리해 앱을 멈추지 않는 방식으로 가용성에 기여한다(BR2.4).

### NFR5.1 — 비용(무료 티어)
- U3는 외부 데이터 소스·키·유료 의존성을 쓰지 않는다(공휴일은 코드 내장 테이블, 날짜 연산은 내장 기능 우선). 따라서 NFR5(모든 런타임 데이터 소스는 무료 티어)를 자명하게 충족한다.

## 유지보수 NFR

### NFR-U3-MAINT.1 — 공휴일 테이블 범위 명시
- 내장 공휴일 테이블은 커버 연도 범위(fromYear~toYear)를 코드 상수로 명확히 노출한다. 범위 밖 날짜는 공휴일 정보 없이 주말만으로 안전 처리하며(BR1.5), 이 동작을 테스트로 보장한다. 테이블 갱신은 수동(연 1회) 유지보수 작업으로 둔다(Q3).

## Sources

- requirements.md(NFR1 접근성·NFR3 성능·NFR4 온라인 전제·NFR5 비용·NFR6 비밀값), functional-spec.md(WF1·WF2), rules.md(BR1.5·BR2.4), contract-summary.md(C1·C2·C3), project.md Forbidden, nfr-requirements-questions.md(Q1~Q3).

## Assumptions & Open Questions

- 공휴일 테이블의 구체 커버 연도 범위 수치와 입력 검증의 구체 실패 처리 형태는 code-generation에서 확정한다. [assumption]
