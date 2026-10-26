# Contract Design — 질문

> 근거: units-generation/unit-of-work.md, units-generation/unit-of-work-dependency.md, domain-design/components.md, requirements-analysis/requirements.md.
> 이 단계는 단위 간·외부 경계의 "계약"(무엇이 어떤 모양으로, 어떤 방식으로 오가고, 실패하면 어떻게 되는가)을 확정한다.
> 맥락: 백엔드 없는 단일 정적 번들(모놀리식 배포). 단위 간 연결은 브라우저 내 동기 함수 호출(Q4=A, units-generation). 외부로 "공개(제공)"하는 API는 없음. 외부로 "소비"하는 것은 무료 날씨 API(U2)와 천문 계산 라이브러리(U1).

## Q1. [아키텍트] 계약의 범위

이 시스템에는 외부로 공개하는 API가 없고, 단위 간 경계(U3→U1·U2, U4→U1·U2·U3)는 모두 브라우저 안 모듈 호출입니다. 계약 문서에 무엇을 담을까요?

A. 내부 단위 간 모듈 인터페이스(각 단위가 노출하는 함수 시그니처·입출력 타입)와 외부로 소비하는 날씨 API 계약을 함께 담는다 (권장)
B. 외부 소비 날씨 API 계약만 담고, 내부 인터페이스는 Functional Design으로 미룬다
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 내부 단위 간 통합 방식 확정

units-generation에서 동기 함수 호출로 정했습니다. 계약서에 어떻게 고정할까요?

A. 모든 내부 경계는 TypeScript 모듈 export(동기 함수 + 타입)로 기술 — shared-schema(타입 계약) 형식으로 입출력 타입을 명시 (권장)
B. 다른 방식을 쓰고 싶다
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 외부 날씨 API 계약(소비)

U2가 소비하는 무료 날씨 API의 계약을 어떻게 기록할까요? (구체 API는 Functional Design에서 확정하되, 계약 형태는 지금 고정)

A. OpenAPI 형식으로 "구름량 예보 조회" 요청/응답 계약을 기록하고, 응답을 U2의 CloudForecast 내부 타입(없음/실패 상태 포함)으로 정규화하는 어댑터 경계로 둔다 (권장)
B. 지금은 추상 계약만 두고 구체 스키마는 Functional Design에서
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 계약 소유권

각 계약(스펙)을 누가 소유(변경 권한)할지입니다.

A. 각 제공 단위가 자기 인터페이스 계약을 소유한다(U1·U2·U3는 자기 export 계약, U2는 날씨 어댑터 계약도). 1인 프로젝트라 변경은 커밋 메시지로 근거를 남긴다 (권장)
B. 다르게 하고 싶다
X. Other (please specify)

[Answer]:A

## Q5. [아키텍트] 버전·호환성 정책

내부 모듈 계약과 외부 날씨 API 계약의 변경/호환성 정책입니다.

A. 내부: 추가 필드는 안전(소비자는 모르는 필드 무시), 깨는 변경은 호출부를 같은 커밋에서 함께 수정. 외부 날씨 API: 버전은 공급자가 관리하므로 U2 어댑터가 응답 변동을 흡수하고 실패/없음으로 격리 (권장)
B. 다른 정책을 쓰고 싶다
X. Other (please specify)

[Answer]:A

## Q6. [아키텍트] 경계별 오류·타임아웃·재시도

경계에서 실패를 어떻게 다룰지입니다(요구사항 FR6.1·FR6.2와 정합).

A. 날씨 API(U2 경계): 호출 실패/타임아웃 시 "실패" 상태 반환(부분 표시), 예보 지평 밖은 "없음" 반환, 과도 재호출 방지 캐시. 재시도는 사용자 행동(화면 재진입) 수준. 천문 계산(U1 경계): 드문 실패 시 에러를 호출부로 전달해 재시도 수단 제공. 내부 함수 경계: 예외 대신 명시적 결과 타입으로 성공/부분/실패 구분 (권장)
B. 다른 오류 처리 방식을 쓰고 싶다
X. Other (please specify)

[Answer]:B(수정). 날씨 API 경계는 구름 상태를 known / outOfHorizon / unknown 3가지로 정규화한다. 호출 실패·타임아웃·파싱 불가는 unknown으로 묶어 UI에서 오류 표시 없이 "구름량 알 수 없음" 중립 문구로만 표시하고(기존 "불러오기 실패" 문구는 폐기, FR6.1 갱신), 내부 reason은 로그용으로만 보존하며 unknown은 짧은 TTL로 캐시한다. 예보 지평 밖은 기존대로 "날씨는 날짜가 가까워지면 표시"로 구분하고 달 조도만으로 추천을 유지한다(FR2.3·FR5.2·AC1.3.3 변경 없음). 예보 범위 안에서 구름량이 unknown이면 추천은 "판단 보류(deferred, missing 사유 포함)"로 반환하며, 구름량과 무관한 천문 정보(U1)는 정상 표시한다. 추천 정렬에서 보류 항목은 점수 있는 항목 뒤에 두되 제외하지 않는다.

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
