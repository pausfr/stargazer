# Log Queries — stargazing-planner

> 정적 클라이언트 앱이라 서버 로그·CloudWatch Logs Insights가 없다. 로깅은 선택적
> 클라이언트 콘솔 로깅 수준. 근거: observability-setup-questions.md Q4.

## 로그 소스

| 소스 | 내용 | 집계 |
|------|------|------|
| 브라우저 콘솔 | 런타임 오류, 날씨 API 호출 실패 메시지 | 집계 인프라 없음(사용자 보고·개발자 확인) |
| 제공자 접근 로그(가능 시) | 요청/상태 코드 | 제공자 기본 Analytics |

## 저장된 쿼리(CloudWatch Logs Insights)

- **해당 없음(N/A)** — 서버 로그·CloudWatch 없음.

## 로깅 원칙(NFR6.3)

- 내부 사유(C2 `reason`, `AstronomyComputationError.code`)는 화면에 노출하지 않는다.
  클라이언트 콘솔 로깅을 추가하더라도 사용자 식별정보·시크릿은 남기지 않는다(시크릿 자체가 없음).

## Sources

- observability-setup-questions.md Q4, security-design.md(SD3 내부 사유 비노출), phases/operation.md.

## Assumptions & Open Questions

- 클라이언트 오류 로깅 도입 여부·범위는 다음 버전 선택 사항. [assumption]
