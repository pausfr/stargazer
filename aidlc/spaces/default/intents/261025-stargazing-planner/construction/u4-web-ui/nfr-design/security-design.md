# Security Design — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: nfr-requirements(security-requirements NFR6.1~6.4), functional-spec(§2 조립·§5 상태머신), contract-summary(C2 reason 로그 전용), project.md(Forbidden 비밀값 비하드코딩), nfr-design-questions.md(Q3). 설계 수준(패턴)만; 구현 코드는 code-generation.
> u4는 소유 엔티티·인증·외부 네트워크 호출이 없는 표시 전용 UI 단위다. 외부 호출은 상위 단위(U1 계산, U2 날씨 API)에 위임한다. 보안 설계는 비밀값 비포함·안전 렌더·내부 사유 비노출·입력 표면 최소에 집중한다.

## 보안 설계 결정

### SD1. 비밀값 비포함 경계 (NFR6.1)
- **패턴**: u4는 외부 호출을 직접 하지 않고 U1(계산)·U2(날씨 API)에 위임한다. 날씨 API는 키 불필요 공개 API를 U2가 소유하므로 UI 코드/번들에 키·토큰이 발생하지 않는다.
- 정적 앱이라 키를 숨길 서버가 없다 — 향후 키 필요 API 도입 시 프록시 여부는 상위(U2/설계)에서 결정하며, UI는 어떤 경우에도 비밀값을 보유하지 않는다.
- **근거**: NFR6.1, project.md Forbidden(클라이언트 번들 시크릿 하드코딩 금지), NFR5·NFR6.

### SD2. 안전 렌더 — 텍스트 바인딩 전용 (NFR6.2)
- **패턴**: 모든 표시 문자열(연휴명 `CalendarDate.label`, 상태 문구, 요약 숫자)은 UI 프레임워크의 기본 텍스트 바인딩/보간으로만 렌더한다. `innerHTML`·`dangerouslySetInnerHTML`·미이스케이프 템플릿 주입 경로를 쓰지 않는다.
- 외부(U2)·계산(U1) 유래 문자열도 동일 규칙으로 렌더해 XSS 표면을 구조적으로 없앤다. 차트 라벨·범례 텍스트도 Chart.js의 텍스트 옵션으로 전달(HTML 주입 아님).
- **근거**: NFR6.2, 구성 가드레일(경계 출력 안전).

### SD3. 내부 사유 비노출 — 상태 매핑 계층 (NFR6.3)
- **패턴**: NightViewAssembler의 상태 매핑 계층이 사용자 표시 문구와 내부 진단 값을 분리한다.
  - C2 `CloudForecast.reason`(status=unknown 내부 사유, 로그 전용)과 `AstronomyComputationError.code` 등 내부 값은 화면으로 전달하지 않는다.
  - 사용자에게는 상태별 중립 문구만: partial="구름량 알 수 없음", outOfHorizon="날씨는 날짜가 가까워지면 표시", error="(천문 계산 실패) 다시 시도".
- **근거**: NFR6.3, contract-summary.md C2, functional-spec §2·§5.

### SD4. 입력 표면 최소 (NFR6.4)
- **패턴**: u4는 계정·로그인·입력 폼·세션이 없다(Out of Scope). 사용자 상호작용은 카드 탭·뒤로가기·"다시 시도" 버튼뿐이며 외부로 쓰기를 발생시키지 않는다. 좌표는 상수 `DEFAULT_LOCATION` 하나로 고정(사용자 입력 아님).
- 따라서 입력 검증·CSRF·세션 관리 설계가 거의 불필요하다. 유일한 "입력"은 라우팅 파라미터 `dateKstId`이며, 알려진 후보 목록에서만 선택되므로 임의 입력 경로가 아니다.
- **근거**: NFR6.4, requirements.md Out of Scope, functional-spec §3·§4·§6.

## 위협 모델 (요약)

| 위협 | u4 노출 | 완화 |
|------|---------|------|
| XSS(표시 문자열) | 외부·계산 유래 문자열 렌더 | SD2 텍스트 바인딩 전용, innerHTML 미사용 |
| 내부 사유 유출 | reason·error code | SD3 상태 매핑 계층에서 차단, 중립 문구만 |
| 비밀값 유출 | 없음(키·네트워크 UI에 없음) | SD1 외부 호출 위임·키 불필요 공개 API |
| 인증·인가 우회 | 없음(계정·세션 없음) | SD4 입력·세션 표면 없음 |
| 임의 입력/주입 | dateKstId 라우팅 | SD4 후보 목록 선택 전용, 폼·쓰기 없음 |
| PII 노출 | 없음(전국 대표 좌표 상수, 사용자 위치 아님) | 좌표 고정, 개인정보 미수집 |

## Sources

- security-requirements.md(NFR6.1~NFR6.4), contract-summary.md(C2 reason 로그 전용), project.md(Forbidden 비밀값), functional-spec.md(§2·§5), requirements.md(Out of Scope), nfr-design-questions.md(Q3), 구성 가드레일(경계 출력 안전).

## Assumptions & Open Questions

- 구체 렌더 프레임워크의 이스케이프 동작과 상태 매핑 계층의 구현 형태는 code-generation에서 확정한다. [assumption]
