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
 * 그날 밤 한 시각의 달 체감 밝기 표본(C1 확장, functional-spec §2.1).
 *
 * 밤 범위를 약 30분 간격으로 균등 샘플링한 각 시각의 달 고도와,
 * "그날 밤 실제 천문 남중 고도 = 100%"로 정규화한 상대 체감 밝기다.
 * 달빛은 위상(illuminated fraction)뿐 아니라 달 고도에 따른 대기 소광(airmass)과
 * 입사각(sin 고도)으로 밤새 크게 변하므로, 수평 기준선이 아닌 시간별 곡선으로
 * 표현하기 위한 데이터다. 고도 ≤ 0(지평 아래)인 시각은 0%.
 */
export interface MoonHourlySample {
  /** 표본 시각 KST ISO(+09:00), 분 단위. */
  hourKst: string;
  /** 그 시각의 달 고도(도). 음수면 지평 아래. */
  altitudeDeg: number;
  /** 남중(100%) 기준 상대 체감 밝기 0~100%. 고도 ≤ 0이면 0. */
  relativeBrightnessPct: number;
}

/**
 * 한 날짜·좌표에 대한 천문 계산 결과. dateKstId로 식별(C1).
 */
export interface AstronomyResult {
  /** 입력 dateKstId를 그대로 반영. */
  dateKstId: string;
  /** 달 조도(illuminated fraction) 0~100%. 월출/월몰 유무와 무관하게 항상 실제값(BR1.1). */
  moonIlluminationPct: number;
  /**
   * 그날 밤 시간별 달 체감 밝기 곡선(C1 확장, §2.1). 상세 그래프 좌y축이 이 배열을
   * 꺾은선으로 그린다. 남중=100%로 정규화된 상대값이며, 위상 스칼라
   * moonIlluminationPct와는 의미가 다른 백분율이다(축·범례로 구분).
   */
  moonHourly: MoonHourlySample[];
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
  /** 실제 그날 밤 범위 시작(일몰) KST ISO. 상세 차트 x축 시작점. */
  nightStart: string;
  /** 실제 그날 밤 범위 끝(다음 일출) KST ISO. 상세 차트 x축 끝점. */
  nightEnd: string;
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
