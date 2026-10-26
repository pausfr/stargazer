# Tech Stack Decisions — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library). 근거: contract-summary.md(C3), team.md Code Style, 기존 U1·U2 구현(src/astronomy, src/weather), nfr-requirements-questions.md.

## 결정

### TSD1. 언어·런타임
- **TypeScript (strict)**, 브라우저/Node 공용. U1·U2와 동일한 루트 설정(tsconfig·Vitest·Prettier·ESLint) 재사용. 신규 런타임 의존성 없음(순수 계산).

### TSD2. 공휴일 데이터
- **코드 내장 테이블**(상수)로 한국 법정공휴일 + 대체공휴일 규칙 보유(Q1 설계 결정). 외부 패키지·API 미사용(무료·오프라인·키 불필요). 커버 연도 범위를 상수로 노출.
- 보류: 날짜 연산에 내장 Date/Intl만 쓸지, 경량 라이브러리를 둘지는 code-generation에서 결정하되, 신규 의존성은 "무료·경량·키 불필요" 원칙을 지킨다(U1·U2와 동일 기조). 기본은 의존성 없이 내장 Date로 구현 시도.

### TSD3. 임계값·상수 분리
- 추천 임계값(MOON_ILLUMINATION_MAX_PCT=20, CLOUD_MAX_PCT=30)과 FORECAST 관련이 아닌 U3 고유 상수(공휴일 테이블 커버 범위, 밤 구간 집계 방식)를 단일 지점(상수 모듈)에 모아 계산과 분리한다(ADR-002, BR2.5).

### TSD4. 입력 타입
- C1(AstronomyResult)·C2(CloudForecast) 타입을 U1·U2의 공개 인덱스에서 그대로 import해 사용한다(어댑터 경계 유지, 원형 외부 타입 비참조).

## 커버리지·테스트
- U3는 핵심 계산/판정 모듈이므로 **라인 커버리지 ≥ 80%** 플로어 적용(team.md Q4). 측정은 `--coverage.include='src/domain-rules/**'`로 경로 한정(project.md 학습).
- test-after: 레이어(달력·추천·상수)별 구현 후 단위 테스트.

## Sources
- contract-summary.md(C3), team.md(Code Style·Testing Posture), project.md(Corrections: 커버리지 측정 관례), src/astronomy·src/weather 기존 구현.

## Assumptions & Open Questions
- 날짜 연산 라이브러리 사용 여부, 공휴일 테이블 커버 연도 범위, 밤 구간 구름량 집계 방식은 code-generation에서 확정한다. [assumption]
