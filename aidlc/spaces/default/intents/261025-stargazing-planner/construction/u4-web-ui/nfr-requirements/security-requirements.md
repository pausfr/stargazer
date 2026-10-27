# Security Requirements — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: requirements.md(NFR6), functional-spec.md(§2 데이터 조립·§5 상태), contract-summary.md(C2 `reason` 로그 전용), project.md(Forbidden 비밀값 비하드코딩), nfr-requirements-questions.md(Q4). 상위 NFR ID에 서브넘버를 붙여 추적.
> u4는 소유 엔티티·인증·외부 네트워크 호출이 없는 표시 전용 UI 단위다. 외부 호출은 상위 단위(U1 계산, U2 날씨 API)에 위임한다. 보안 초점은 비밀값 비포함과 외부 데이터의 안전한 렌더링이다.

## 보안 요구

| ID | 요구 | 근거 | 측정/판정 |
|----|------|------|-----------|
| NFR6.1 | u4는 API 키·토큰 등 어떤 비밀값도 UI 코드/번들에 두지 않는다. 날씨 API는 키 불필요 공개 API를 U2가 소유하므로 UI에 키가 발생하지 않는다. 정적 앱이라 키를 숨길 서버가 없다. | NFR6, project.md Forbidden | 번들·소스에 하드코딩된 시크릿 0건(린터/수동 점검). |
| NFR6.2 | 외부·계산 데이터를 화면에 표시할 때 안전하게 렌더한다. 표시 문자열(연휴 이름 `CalendarDate.label` 등)은 UI 프레임워크의 기본 텍스트 이스케이프로 렌더하고, `innerHTML`·`dangerouslySetInnerHTML` 등 미이스케이프 주입 경로를 쓰지 않는다. | 구성 가드레일(경계 입력/출력 안전), NFR6 | 미이스케이프 HTML 주입 경로 0건(코드 리뷰·린터). |
| NFR6.3 | 내부 사유 필드는 사용자에게 노출하지 않는다. C2 `CloudForecast.reason`(status=unknown 시 내부 사유, 로그 전용)과 `AstronomyComputationError.code` 같은 내부 진단 값은 화면에 그리지 않고, 사용자에게는 중립 문구("구름량 알 수 없음", 재시도 안내)만 표시한다. | contract-summary.md C2(reason 로그 전용), functional-spec §2·§5, FR6.1 | unknown/에러 상태 화면에 내부 사유 문자열이 나타나지 않음(상태 렌더 단위/스모크). |
| NFR6.4 | u4는 계정·로그인·입력 폼이 없어 사용자 입력을 수집하지 않는다(Out of Scope). 따라서 입력 검증·세션·CSRF 표면이 거의 없으며, 유일한 사용자 상호작용은 카드 탭·뒤로가기·"다시 시도" 버튼으로 외부에 쓰기를 발생시키지 않는다. | requirements.md Out of Scope, functional-spec §3·§4·§6 | 입력 폼·인증·쓰기 경로 0건(설계·코드 확인). |

## 위협 고려 (해당 없음/낮음)

- **인증·인가**: u4에 없음(계정·세션 개념 없음, 읽기 전용 표시).
- **XSS**: 유일한 표면은 외부/계산 문자열 렌더이며 NFR6.2(기본 이스케이프)·NFR6.3(내부 사유 비노출)으로 차단. 사용자 입력 반영 경로가 없어 저장형/반사형 XSS 표면이 거의 없다.
- **데이터 보호·개인정보(PII)**: u4는 PII를 다루지 않는다(좌표는 전국 대표 좌표 하나 상수 `DEFAULT_LOCATION`, 사용자 위치 아님). 로컬 저장은 세션 내 구름 예보 캐시(민감정보 아님)뿐이다.
- **비밀값 유출**: 외부 호출을 UI가 직접 하지 않고 키 불필요 공개 API를 전제하므로(NFR6.1) 키 유출 표면이 발생하지 않는다. 향후 키 필요 API 도입 시 프록시 여부는 상위(U2/설계)에서 결정한다.

## Sources

- NFR6 (requirements.md): 비밀값 비하드코딩, 키 불필요 공개 API 우선.
- project.md Forbidden: 클라이언트 번들에 API 키·시크릿 하드코딩 금지.
- contract-summary.md C2: `reason`는 status=unknown 시 내부 사유(로그 전용, UI 비노출).
- functional-spec.md §2·§5: 내부 사유 비노출·중립 문구, 상태 구분 렌더.
- requirements.md Out of Scope: 계정/로그인·폼 없음.
- 구성 가드레일: 시스템 경계 출력 안전(이스케이프), silent failure 금지.

## Assumptions & Open Questions

None.
