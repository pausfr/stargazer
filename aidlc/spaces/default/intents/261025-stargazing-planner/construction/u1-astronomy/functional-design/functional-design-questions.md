# Functional Design — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: unit-of-work.md, contract-summary.md(C1 AstronomyResult, C5 천문 라이브러리), requirements.md(FR3.3·FR3.4·FR4.1·FR4.2), stories(US3.1·US3.2·US4.2 등), components.md(AstronomyEngine).
> 이 단위는 날짜(KST)+전국 대표 좌표로 달 조도·박명·완전한 밤·월출/월몰을 결정론적으로 계산하는 순수 계산 라이브러리다. 설계 수준(엔티티·규칙·동작 명세)만 다루며 구현 코드는 code-generation에서.
> 대부분의 설계 결정은 이미 확정(계약 C1, 요구사항). 아래는 설계를 확정하기 위한 핵심 공백만 묻는다.

## Q1. [아키텍트] 월출/월몰 "없음" 판정의 밤 범위

AC3.2.3은 "그날 밤에 월출 또는 월몰이 없으면 '없음'으로 표시"입니다. "그날 밤"은 KST 저녁~다음날 새벽(U3의 nightStart~nightEnd). 월출/월몰 "없음" 판정을 어느 범위로 할까요?

A. U3이 정한 "그날 밤" 범위(nightStart~nightEnd) 안에서 월출/월몰이 일어나는지로 판정. 범위 밖이면 null("없음") (권장: AC3.2.3와 상세 그래프 범위에 일관)
B. 달력일(00:00~24:00 KST) 기준으로 판정
X. Other (please specify)

[Answer]:A(수정). 월출/월몰은 U3이 정한 "그날 밤"(nightStart~nightEnd) 범위 안에서 일어날 때만 시각을 반환하고, 범위 안에 없으면 null로 반환한다. 달 조도는 월출/월몰 유무와 무관하게 항상 실제 계산값을 반환한다(조도를 0으로 대체하지 않음). null인 월출/월몰은 UI에서 "없음" 문구 없이 해당 항목을 생략한다(AC3.2.3 갱신 대상).

## Q2. [아키텍트] 완전한 밤이 없는 날의 처리

고위도/백야성 상황은 한국에선 드물지만, 저녁 천문박명 종료 이후에도 하늘이 충분히 어두워지지 않거나(여름 짧은 밤) 천문박명 경계가 모호한 날이 있을 수 있습니다. fullDarkStart/End를 어떻게 둘까요?

A. 완전한 밤 구간이 성립하면 시각, 성립하지 않으면 둘 다 null로 반환하고 호출부(U4)가 "완전한 밤 없음"으로 표시 (권장: C1이 이미 null 허용)
B. 항상 값을 강제로 계산
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 입력 날짜 범위와 시간대 처리

A. 입력은 KST 날짜 키(dateKstId)와 좌표. 라이브러리 내부는 UTC로 계산하고 출력 시각만 KST ISO 문자열로 반환. 과거/미래 3개월+ 어떤 날짜든 결정론적으로 계산 (권장, C3 KST 고정과 일관)
B. 다른 시간대 처리 방식
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 조도·시각 계산의 정밀도/반올림

A. 조도는 0~100% 정수(또는 소수 1자리)로 반올림, 시각은 분 단위로 반올림해 표시. 내부 계산은 라이브러리 정밀도 그대로 두고 경계(표시)에서만 반올림 (권장: 표시 일관·테스트 용이)
B. 다른 정밀도 정책
X. Other (please specify)

[Answer]:A

## Q5. [아키텍트] 계산 실패(FR6.2) 처리

A. 천문 계산은 순수·결정론적이라 실패는 드묾(잘못된 입력 등). 유효하지 않은 입력은 AstronomyComputationError(code: "astronomy_failed", retryable: true)로 호출부에 전달(C1), 라이브러리는 조용히 실패하지 않음 (권장)
B. 다른 오류 처리
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
