/**
 * u1-astronomy 공개 타입 (C1 계약 반영).
 *
 * 모든 시각은 KST ISO 문자열이며, 내부 계산은 UTC로 하고 출력 경계에서만
 * KST로 변환한다(BR4.2). 조도·시각은 출력 경계에서만 반올림한다(BR4.1).
 */

/**
 * 박명 한 종류(시민/항해/천문)의 저녁·새벽 경계. 값 객체.
 * 해당 박명 경계가 그날 성립하지 않으면 start/end가 각각 null(BR2.1).
 * C1 갱신: start/end를 nullable로 둔다.
 */
export interface TwilightWindow {
  /** 저녁 박명 경계 시각 KST ISO. 성립하지 않으면 null. */
  start: string | null;
  /** 새벽 박명 경계 시각 KST ISO. 성립하지 않으면 null. */
  end: string | null;
}

/**
 * 천문 계산의 입력. KST 날짜 키와 전국 대표 좌표.
 * "그날 밤" 경계(nightStartKst/nightEndKst)는 선택 입력이며,
 * 없으면 BR3.2 기본 범위(해당 KST 날짜 18:00 ~ 다음날 06:00)를 적용한다.
 */
export interface AstronomyInput {
  /** KST 날짜 키, 형식 YYYY-MM-DD. */
  dateKstId: string;
  /** 위도(도), [-90, 90]. */
  lat: number;
  /** 경도(도), [-180, 180]. */
  lon: number;
  /** "그날 밤" 시작 시각(KST ISO). nightEndKst와 쌍. 없으면 기본 범위(BR3.2). */
  nightStartKst?: string | null;
  /** "그날 밤" 끝 시각(KST ISO). nightStartKst와 쌍. 없으면 기본 범위(BR3.2). */
  nightEndKst?: string | null;
}

/**
 * 한 날짜·좌표에 대한 천문 계산 결과. dateKstId로 식별(C1).
 */
export interface AstronomyResult {
  /** 입력 dateKstId를 그대로 반영. */
  dateKstId: string;
  /** 달 조도(illuminated fraction) 0~100%. 월출/월몰 유무와 무관하게 항상 실제값(BR1.1). */
  moonIlluminationPct: number;
  /** 시민박명 구간(-6도). */
  civilTwilight: TwilightWindow;
  /** 항해박명 구간(-12도). */
  nauticalTwilight: TwilightWindow;
  /** 천문박명 구간(-18도). */
  astronomicalTwilight: TwilightWindow;
  /** 완전한 밤 시작(저녁 천문박명 종료) KST ISO. 미성립 시 null(BR2.2). */
  fullDarkStart: string | null;
  /** 완전한 밤 끝(새벽 천문박명 시작) KST ISO. fullDarkStart와 쌍. */
  fullDarkEnd: string | null;
  /** "그날 밤" 범위 안의 월출 시각 KST ISO. 범위 밖이면 null(BR3.1). */
  moonrise: string | null;
  /** "그날 밤" 범위 안의 월몰 시각 KST ISO. 범위 밖이면 null(BR3.1). */
  moonset: string | null;
}

/**
 * 드문 계산 실패(유효하지 않은 입력 등)를 호출부에 전달하는 오류(C1, FR6.2, BR5.1).
 * 조용히 실패하지 않고 이 오류를 던진다.
 */
export class AstronomyComputationError extends Error {
  readonly code: 'astronomy_failed' = 'astronomy_failed';
  readonly retryable: true = true;

  constructor(message?: string) {
    super(message ?? 'astronomy computation failed');
    this.name = 'AstronomyComputationError';
    // TypeScript로 Error 상속 시 instanceof 보정.
    Object.setPrototypeOf(this, AstronomyComputationError.prototype);
  }
}
