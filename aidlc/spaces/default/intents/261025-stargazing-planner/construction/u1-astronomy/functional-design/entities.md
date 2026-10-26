# Entities — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: contract-summary.md(C1 AstronomyResult), components.md(AstronomyEngine), functional-design-questions.md(Q1~Q5). 기술 비의존 설계; 구현 코드는 code-generation에서.

## 소스 오브 트루스 (entity model)

```yaml
entities:
  - name: AstronomyInput
    description: 천문 계산의 입력. KST 날짜 키와 전국 대표 좌표. "그날 밤" 경계는 선택 입력(없으면 기본 범위 규칙 적용, BR3.2).
    attributes:
      - name: dateKstId
        type: string
        required: true
        constraints: "KST 날짜 키, 형식 YYYY-MM-DD (예: 2026-10-26)"
      - name: lat
        type: number
        required: true
        min: -90
        max: 90
        constraints: "전국 대표 좌표 위도(도)"
      - name: lon
        type: number
        required: true
        min: -180
        max: 180
        constraints: "전국 대표 좌표 경도(도)"
      - name: nightStartKst
        type: string
        required: false
        constraints: >
          "그날 밤" 시작 시각(KST ISO). U3이 산출해 전달. 월출/월몰 "그날 밤" 범위 판정에 쓰임(Q1, BR3.1).
          없으면 BR3.2의 기본 범위 규칙(해당 KST 날짜 18:00 ~ 다음날 06:00)을 적용한다(결정론적; "미정" 아님).
      - name: nightEndKst
        type: string
        required: false
        constraints: "\"그날 밤\" 끝 시각(KST ISO, 보통 다음날 새벽). nightStartKst와 쌍. 없으면 BR3.2 기본 범위 적용."

  - name: AstronomyResult
    description: 한 날짜·좌표에 대한 천문 계산 결과. dateKstId로 식별(C1).
    identifier: dateKstId
    attributes:
      - name: dateKstId
        type: string
        required: true
        unique: true
        constraints: "입력 dateKstId를 그대로 반영"
      - name: moonIlluminationPct
        type: number
        required: true
        min: 0
        max: 100
        constraints: "달 조도(illuminated fraction) 0~100%. 표시용 반올림(Q4). 월출/월몰 유무와 무관하게 항상 실제 계산값(Q1)."
      - name: civilTwilight
        type: TwilightWindow
        required: true
        constraints: "시민박명 구간"
      - name: nauticalTwilight
        type: TwilightWindow
        required: true
        constraints: "항해박명 구간"
      - name: astronomicalTwilight
        type: TwilightWindow
        required: true
        constraints: "천문박명 구간"
      - name: fullDarkStart
        type: string
        required: false
        constraints: "완전한 밤 시작(저녁 천문박명 종료) KST ISO 시각. 완전한 밤이 성립하지 않으면 null(Q2)."
      - name: fullDarkEnd
        type: string
        required: false
        constraints: "완전한 밤 끝(새벽 천문박명 시작) KST ISO 시각. 성립하지 않으면 null. fullDarkStart와 쌍(둘 다 null이거나 둘 다 값)."
      - name: moonrise
        type: string
        required: false
        constraints: "\"그날 밤\"(nightStart~nightEnd) 범위 안의 월출 시각 KST ISO. 범위 안에 없으면 null(Q1, AC3.2.3)."
      - name: moonset
        type: string
        required: false
        constraints: "\"그날 밤\" 범위 안의 월몰 시각 KST ISO. 범위 안에 없으면 null."
    constraints:
      - "fullDarkStart와 fullDarkEnd는 쌍: 둘 다 값이거나 둘 다 null."
      - "moonrise/moonset은 서로 독립: 하나만 null일 수 있음(밤새 떠 있거나 아예 안 뜨는 경우)."
      - "모든 시각은 KST ISO 문자열, 분 단위 반올림(Q4)."

  - name: TwilightWindow
    description: >
      박명 한 종류(시민/항해/천문)의 저녁·새벽 경계. 값 객체. 필드명은 C1 계약의 start/end를 따른다.
      C1은 start/end를 필수(non-null)로 정의했으나, 박명 경계가 성립하지 않는 날을 표현하려면 null이 필요하므로
      C1을 start/end nullable로 갱신한다(아래 "C1 계약 갱신" 참조).
    attributes:
      - name: start
        type: string
        required: false
        constraints: "저녁 박명 경계 시각 KST ISO. 해당 박명이 그날 성립하지 않으면 null."
      - name: end
        type: string
        required: false
        constraints: "새벽 박명 경계 시각 KST ISO. 성립하지 않으면 null."

  - name: AstronomyComputationError
    description: 드문 계산 실패(유효하지 않은 입력 등)를 호출부에 전달하는 오류(C1, FR6.2, Q5).
    attributes:
      - name: code
        type: string
        required: true
        allowed_values: ["astronomy_failed"]
      - name: retryable
        type: boolean
        required: true
        defaults: true
      - name: message
        type: string
        required: false
        constraints: "사람이 읽는 사유(로그/표시용)"

relationships:
  - "AstronomyResult는 1개의 civil/nautical/astronomical TwilightWindow를 각각 포함(1:1, 합성)."
  - "AstronomyInput → AstronomyResult: 한 입력이 한 결과를 결정론적으로 산출(1:1, 함수적)."
```

## 사람이 읽는 요약

U1은 데이터 저장이 없는 순수 계산 라이브러리다. 입력 `AstronomyInput`(KST 날짜·좌표, 그리고 월출/월몰 범위 판정을 위한 "그날 밤" 경계)을 받아 결과 `AstronomyResult`를 반환한다. 결과는 달 조도(항상 실제값), 박명 3종(각 `TwilightWindow`), 완전한 밤 구간(성립 안 하면 null 쌍), "그날 밤" 범위 안의 월출·월몰(범위 밖이면 null)을 담는다. 유효하지 않은 입력은 `AstronomyComputationError`로 호출부에 전달한다. 엔티티는 영속 저장이 아니라 계산 입출력의 논리 모양이다(C1 계약과 일치).

## C1 계약 갱신 (이 단위가 소유한 계약의 명시적 변경)

U1은 C1(contract-summary.md의 U1 astronomy 모듈 계약)을 소유한다. 이 설계는 C1에 두 가지 깨는-변경(breaking change)을 요구하며, 여기에 명시적으로 기록한다. 깨는-변경 규칙(contract-summary.md): 제공 단위와 모든 호출부(U3·U4)를 같은 커밋에서 함께 수정한다.

1. **AstronomyInput에 "그날 밤" 경계 입력 추가** — C1 원안은 `{ dateKstId, lat, lon }`뿐이었다. 월출/월몰의 "그날 밤" 판정(BR3.1)을 결정론적으로 하려면 범위가 필요하므로 선택 입력 `nightStartKst`/`nightEndKst`를 추가한다. 두 값이 없을 때의 동작은 BR3.2 기본 범위(해당 KST 날짜 18:00 ~ 다음날 06:00)로 결정론적으로 정의한다. 호출부: U3이 "그날 밤" 범위를 산출하므로 보통 값을 전달하고, 전달하지 않으면 기본 범위가 적용된다.
2. **TwilightWindow를 nullable로** — C1 원안은 `{ start: string, end: string }`(필수)였다. 박명 경계가 성립하지 않는 날을 표현하기 위해 `{ start: string | null, end: string | null }`로 갱신한다. 필드명(start/end)은 C1을 그대로 유지한다. 호출부(U4)는 null을 "해당 박명 없음"으로 처리한다.

(contract-summary.md 자체는 Contract Design 단계의 승인된 산출물이므로 이 설계가 직접 수정하지 않는다. 위 두 갱신은 U1 code-generation과 U3·U4 설계가 반영할 계약 변경으로 기록되며, Functional Design 승인이 이 갱신의 승인을 겸한다.)

## Assumptions & Open Questions

- 월출/월몰 null을 UI에서 "없음" 문구로 표시할지 생략할지는 U4 Functional Design에서 AC3.2.3 갱신으로 확정(U1은 null 반환까지만). 현재 stories.md의 AC3.2.3은 "없음 표시"를 요구하며 아직 상류 미반영 상태다. [assumption]
- 위 "C1 계약 갱신" 2건은 U3·U4 설계와 code-generation에서 호출부를 함께 맞춘다. [assumption]
- 구체 천문 계산 라이브러리와 전국 대표 좌표는 code-generation/설계에서 확정(A3). [assumption]
