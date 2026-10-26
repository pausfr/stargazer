# Logical Components — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: functional-spec, rules, security-design.md, nfr-design-questions.md(Q3·Q4). NFR 설계 결정을 컴포넌트 수준 뷰로 연결.
> u2는 배포 서비스가 아니라 정적 번들에 임베드되는 데이터 접근 라이브러리다.

## 논리 컴포넌트 인벤토리

| 컴포넌트 | 책임 | 격리/경계 | 공유 자원 |
|----------|------|-----------|-----------|
| `getCloudForecast` (진입점) | 입력 검증(SD1) → 캐시 조회 → 지평 컷오프 판정 → WeatherClient 호출 → 결과 캐시·반환 | 모듈 public 경계. 유일한 외부 진입점. | 없음 |
| WeatherClient (어댑터, 내부) | 외부 날씨 API 호출(타임아웃)·응답 파싱·3-상태 정규화(SD2) | 내부. 유일한 네트워크 egress 지점. 외부 응답을 CloudForecast로만 변환. | 외부 무료 날씨 API(읽기 전용 HTTP) |
| DataCache (내부) | cacheKey(dateKstId+좌표) TTL 캐시 보관·만료 | 내부. 세션 범위 메모리. | 없음(세션 메모리) |

## 실패 도메인·블라스트 반경

- **실패 도메인**: u2의 외부 의존은 날씨 API 하나(WeatherClient egress). 호출 실패·타임아웃·파싱불가는 WeatherClient가 unknown으로 격리해 getCloudForecast가 결과 타입으로 반환한다(예외 전파 없음).
- **블라스트 반경**: u2 실패는 해당 날짜·좌표의 구름 조회에 국한된다. 한 조회 실패가 다른 조회·다른 단위(U1 천문)에 영향을 주지 않는다. 천문 정보(U1)는 u2 실패와 무관하게 표시된다(앱 비차단, NFR4.1).
- **격리 전략**: 외부 API 접근을 WeatherClient 내부로 캡슐화해 U3·U4가 API를 직접 모르게 한다(C2 CloudForecast 계약만 노출). DataCache도 내부에 숨어 getCloudForecast 뒤에서만 쓰인다.

## NFR 패턴 적용 위치

| NFR 패턴 | 적용 컴포넌트 |
|----------|---------------|
| 입력 검증 게이트(SD1) | getCloudForecast 진입점 |
| 외부 응답 비신뢰 정규화(SD2) | WeatherClient |
| 비밀값/네트워크 표면 최소화(SD3) | WeatherClient(단일 egress), 키 불필요 |
| 타임아웃·단일 호출·실패 격리 | WeatherClient |
| TTL 캐시·호출 억제 | DataCache + getCloudForecast(14일 컷오프) |

(성능/확장성/신뢰성/관측성 설계는 library kind에 미적용 — 배포 서비스가 아님. 캐시·타임아웃은 위 복원력 패턴으로 충분하며 별도 스케일링·헬스체크·메트릭 설계는 두지 않는다.)

## Sources

- security-design.md(SD1·SD2·SD3·복원력), functional-spec.md(WF1), rules.md(BR1.1~BR4.1), tech-stack-decisions.md.

## Assumptions & Open Questions

None.
