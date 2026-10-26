# Infrastructure Design Questions — u3-domain-rules

> 단위 U3 u3-domain-rules (library, embedded). 단일 정적 번들의 일부라 별도 인프라가 없고, 산출물은 CI/CD 파이프라인 단위 몫 + traceability뿐입니다(u1·u2와 동일). 외부 I/O·비밀값 없음.

---

## Q1. U3의 CI 단위 몫
U3의 CI 기여를 다음으로 확정할까요?
- 공유 CI(번들 전체)에서 U3 몫: `npx eslint src/domain-rules` + `npx tsc --noEmit` + `npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'`(핵심 모듈 ≥ 80% 플로어). 외부 네트워크 호출 없음(U3는 순수). main 머지 시 번들과 함께 자동 배포(team.md Deployment).

- A. 이대로 확정(권장).
- B. 조정(적어 주세요).

[Answer]: A

---

## Consolidated Summary Confirmation

아래대로 산출물(cicd-pipeline.md·traceability.json)을 생성합니다.

- U3는 embedded 라이브러리로 별도 인프라 없음. 공유 CI에서 U3 몫: eslint src/domain-rules + tsc --noEmit + vitest run src/domain-rules --coverage(핵심 모듈 ≥ 80%). 외부 네트워크 호출 없음. main 머지 시 번들과 함께 무료 정적 호스팅 자동 배포.

프롬프트: 이대로 산출물을 생성해도 될까요?
- Looks correct
- Request changes

[Answer]: Looks correct
