# Business Rules — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: requirements.md(FR3.3·FR3.4·FR4.1·FR4.2·FR6.2), stories(AC3.1.2·AC3.2.1·AC3.2.3·AC4.2.1), functional-design-questions.md(Q1~Q5), contract-summary.md(C1). 기술 비의존.

## 소스 오브 트루스 (business rules)

```yaml
rules:
  - id: BR1.1
    statement: "달 조도는 월출/월몰 유무와 무관하게 항상 실제 계산값(0~100%)으로 반환한다."
    category: calculation
    applies_to: AstronomyResult.moonIlluminationPct
    trigger: "AstronomyInput으로 계산 요청"
    logic: "IF 입력이 유효하면 THEN 해당 날짜·좌표의 달 illuminated fraction을 계산해 0~100%로 반환한다(조도를 월출/월몰 상태로 대체하지 않는다)."
    violation_behaviour: "유효하지 않은 입력이면 BR5.1에 따라 오류 전달."
    source: FR4.2

  - id: BR2.1
    statement: "박명 3종(시민·항해·천문)의 저녁·새벽 경계 시각을 계산한다."
    category: calculation
    applies_to: "AstronomyResult.civilTwilight / nauticalTwilight / astronomicalTwilight"
    trigger: "계산 요청"
    logic: "IF 해당 박명 경계가 그날 성립하면 THEN 그 시각(KST)을, 아니면 해당 경계를 null로 반환한다."
    violation_behaviour: "없음(각 경계는 독립적으로 null 가능)."
    source: FR3.3

  - id: BR2.2
    statement: "완전한 밤 구간은 저녁 천문박명 종료부터 새벽 천문박명 시작까지로 정의한다."
    category: calculation
    applies_to: "AstronomyResult.fullDarkStart / fullDarkEnd"
    trigger: "계산 요청"
    logic: "IF 저녁 천문박명 종료와 새벽 천문박명 시작이 모두 성립하고 전자가 후자보다 앞서면 THEN fullDarkStart=저녁 천문박명 종료, fullDarkEnd=새벽 천문박명 시작으로 반환한다. ELSE 둘 다 null로 반환한다(Q2)."
    violation_behaviour: "구간 미성립 시 둘 다 null(쌍 불변식 유지)."
    source: FR3.3

  - id: BR3.1
    statement: "월출·월몰은 \"그날 밤\"(nightStart~nightEnd) 범위 안에서 일어날 때만 시각을 반환하고, 범위 안에 없으면 null로 반환한다."
    category: calculation
    applies_to: "AstronomyResult.moonrise / moonset"
    trigger: "계산 요청, nightStartKst/nightEndKst 제공 또는 BR3.2 기본 범위"
    logic: "IF 월출(또는 월몰)이 [nightStart, nightEnd] 구간 안에 있으면 THEN 그 시각(KST)을, 아니면 null을 반환한다. moonrise와 moonset은 독립적으로 null 가능(밤새 떠 있거나 아예 안 뜸)."
    violation_behaviour: "범위 밖이면 null(U4는 null을 '없음'(월출 없음/월몰 없음)으로 명시 표시, AC3.2.3 확정)."
    source: FR3.4

  - id: BR3.2
    statement: "\"그날 밤\" 경계 입력(nightStart/End)이 없으면 기본 범위 '해당 KST 날짜 18:00 ~ 다음날 06:00'을 적용한다."
    category: policy
    applies_to: "AstronomyInput.nightStartKst / nightEndKst, BR3.1 판정 범위"
    trigger: "계산 요청 시 nightStart/End 미제공"
    logic: "IF nightStartKst와 nightEndKst가 모두 없으면 THEN nightStart=dateKstId 18:00 KST, nightEnd=다음날 06:00 KST를 기본 범위로 써서 BR3.1을 결정론적으로 수행한다(미정 아님). 둘 중 하나만 제공되면 유효하지 않은 입력으로 보고 BR5.1을 따른다."
    violation_behaviour: "경계 쌍이 반쪽만 오면 BR5.1 오류."
    source: FR3.4

  - id: BR4.1
    statement: "표시용 값은 경계에서만 반올림한다: 조도는 0~100%(정수 또는 소수 1자리), 시각은 분 단위."
    category: policy
    applies_to: "AstronomyResult 전체"
    trigger: "결과 반환 직전"
    logic: "IF 결과를 반환하면 THEN 내부 계산은 라이브러리 정밀도 그대로 두되, 조도와 시각은 표시 정밀도로 반올림한 값을 반환한다."
    violation_behaviour: "없음."
    source: FR4.2

  - id: BR4.2
    statement: "모든 시각은 KST ISO 문자열로 반환한다. 내부 계산은 UTC로 하되 출력만 KST."
    category: policy
    applies_to: "AstronomyResult의 모든 시각 필드"
    trigger: "결과 반환 직전"
    logic: "IF 시각을 반환하면 THEN UTC 계산 결과를 KST(UTC+9) ISO 문자열로 변환해 반환한다(C3 KST 고정)."
    violation_behaviour: "없음."
    source: FR4.1

  - id: BR5.1
    statement: "유효하지 않은 입력은 조용히 실패하지 않고 AstronomyComputationError로 호출부에 전달한다."
    category: validation
    applies_to: AstronomyInput
    trigger: "계산 요청"
    logic: "IF dateKstId 형식이 잘못됐거나 lat/lon이 범위를 벗어나거나 계산이 불가능하면 THEN code=\"astronomy_failed\", retryable=true인 오류를 반환/던진다(라이브러리는 부분·조용한 실패를 하지 않음)."
    violation_behaviour: "오류를 삼키지 않는다(Construction 가드레일: silent failure 금지)."
    source: FR6.2
```

## 규칙 요약

| ID | 범주 | 요지 | 출처 |
|----|------|------|------|
| BR1.1 | calculation | 달 조도는 항상 실제값(0~100%) | FR4.2 |
| BR2.1 | calculation | 박명 3종 경계 계산, 미성립 경계는 null | FR3.3 |
| BR2.2 | calculation | 완전한 밤 = 저녁 천문박명 종료~새벽 천문박명 시작, 미성립 시 null 쌍 | FR3.3 |
| BR3.1 | calculation | 월출·월몰은 "그날 밤" 범위 안일 때만, 아니면 null | FR3.4 |
| BR3.2 | policy | "그날 밤" 입력 없으면 기본 범위(18:00~익일 06:00) 적용 | FR3.4 |
| BR4.1 | policy | 경계에서만 반올림(조도·시각) | FR4.2 |
| BR4.2 | policy | 시각은 KST ISO, 내부 UTC 계산 | FR4.1 |
| BR5.1 | validation | 유효하지 않은 입력은 오류로 전달(조용한 실패 금지) | FR6.2 |

## Assumptions & Open Questions

None.
