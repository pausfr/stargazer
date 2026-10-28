/**
 * 이중축 그래프 래퍼 (Chart.js 4 + chartjs-plugin-annotation 3).
 * (FR3.2·3.3·3.5, functional-spec §2.1·§4, PD4)
 *
 * 재작업(3차 반려 보완 — 디자인/로직 전면 재검토):
 * - (5) 좌y축(달 체감 밝기): `astro.moonHourly`를 **시간별 꺾은선**으로 그린다
 *   (수평 기준선 아님; 월출 ~0 → 남중 100% → 월몰 ~0, §2.1 갱신).
 * - (2) X축: 내부는 epoch ms(linear 스케일)로 두고, 눈금은 **1시간 고정 간격**
 *   (KST 정시, afterBuildTicks로 직접 생성)으로 렌더한다 — Chart.js의
 *   auto-tick에 맡기면 간격이 들쭉날쭉해 의미를 알기 어려웠다(2-5번 보완).
 * - (7/8) 박명 음영: 시민<항해<천문<완전한 밤 순으로 배경 alpha를 더 크게
 *   차등 적용하고, 각 box 폭(duration)에 따라 라벨 배치 전략을 바꾼다:
 *   폭이 좁으면 세로(rotation -90deg)로 눕혀 겹침 없이 박스 안에 넣고,
 *   넓은 구간(천문박명처럼 긴 면적)은 대각선(rotation -45deg)으로 배치해
 *   가독성과 디자인적 구분을 함께 준다(2-2·2-2-1번 보완).
 * - 월출/월몰 세로선(line annotation)을 추가해 어느 시점에 뜨고 지는지
 *   한눈에 보이게 한다(2-1번 보완). null이면 선을 생략한다.
 * - 우y축(구름량): cloud.status==='known'일 때만 hourlyCloudPct 시계열.
 * - 단일 Chart 인스턴스를 유지하고 날짜 전환 시 data만 갱신한다(PD4).
 *
 * 실제 그리기는 수동 스모크 대상이며, Chart 구성 산출을 순수 함수로 분리해
 * 단위 테스트 가능하게 한다(buildChartConfig·buildAnnotations·buildMoonCurve·
 * buildMoonMarkers·buildHourlyTicks·formatKstHourMinute).
 */

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
  type ChartConfiguration,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import type { AstronomyResult, CloudForecast } from './types.js';

// x축은 숫자(epoch ms)를 쓰는 linear 스케일이라 time 어댑터가 필요 없다.
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
  annotationPlugin,
);

/**
 * Chart.js 기본 폰트에 한글 글리프를 지원하는 시스템 폰트를 명시한다.
 * canvas 텍스트는 DOM CSS font-family(index.html)를 따르지 않고 Chart.js
 * 자체 기본값(Helvetica 계열)을 쓰므로, 지정하지 않으면 한글이 '□' 같은
 * 대체 글리프로 깨져 보인다(한글 미지원 폰트 사용). 범례·축·툴팁 등
 * Chart.js가 그리는 모든 텍스트에 공통 적용된다.
 */
Chart.defaults.font.family =
  '"Apple SD Gothic Neo", "Malgun Gothic", system-ui, -apple-system, sans-serif';
// 축 눈금·축 제목·범례 등 Chart.js가 그리는 텍스트 기본 크기를 줄인다(기본 12 → 10).
Chart.defaults.font.size = 10;

/**
 * 박명 음영 box 라벨을 픽셀 단위로 직접 그리는 커스텀 플러그인(2-2·2-2-1번).
 *
 * chartjs-plugin-annotation의 box label은 고정된 숫자 rotation만 지원해
 * "박스의 실제 대각선을 따라가는 긴 텍스트"를 표현할 수 없었다. 이 플러그인은
 * 렌더 시점의 실제 픽셀 좌표(스케일 변환 후)를 읽어:
 * - civil·nautical(좁고 양옆): 가로 텍스트를 90°/270°로 세워 박스 안에 넣는다.
 * - astronomical(길고 넓음): 박스의 왼쪽 위~오른쪽 아래 꼭짓점을 잇는 실제
 *   대각선 각도로 회전한 큰 글씨를 그 선을 따라 배치한다.
 * - fullDark: 가로 텍스트로 중앙에 둔다.
 *
 * chart.$shadeLabels(render가 매 호출마다 세팅)를 읽어 그린다 — annotation
 * box 자체는 음영만 맡고 이 플러그인은 그 위에 텍스트만 덧그린다.
 */
const shadeLabelPlugin = {
  id: 'shadeLabelPlugin',
  afterDatasetsDraw(chart: Chart): void {
    const items = (chart as unknown as { $shadeLabels?: ShadeLabelItem[] }).$shadeLabels;
    if (items === undefined || items.length === 0) return;
    const { ctx, chartArea } = chart;
    const xScale = chart.scales.x;
    const yScale = chart.scales.yMoon;
    if (xScale === undefined || yScale === undefined || chartArea === undefined) return;

    // 플롯 영역으로 클리핑: pan으로 보이는 창 밖으로 밀려난 라벨이 차트
    // 바깥까지 삐져나오지 않도록 한다(그래프가 튀어나와 보이던 원인).
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top,
    );
    ctx.clip();

    for (const item of items) {
      const left = xScale.getPixelForValue(item.xMin);
      const right = xScale.getPixelForValue(item.xMax);
      const centerX = (left + right) / 2;
      // 라벨 중심이 보이는 플롯 영역 밖이면 그리지 않는다(클리핑 보강).
      if (centerX < chartArea.left || centerX > chartArea.right) continue;
      const top = yScale.getPixelForValue(100);
      const bottom = yScale.getPixelForValue(0);
      const centerY = (top + bottom) / 2;

      ctx.save();
      ctx.fillStyle = COLORS.shadeLabel;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      // 자간을 넓혀 세로로 읽는 라벨의 가독성을 높인다(지원 브라우저 한정,
      // 미지원 시 자동 무시).
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '3px';

      if (item.placement.kind === 'vertical') {
        ctx.font = `11px ${KOREAN_FONT_STACK}`;
        ctx.translate(centerX, centerY);
        ctx.rotate((item.placement.rotationDeg * Math.PI) / 180);
        ctx.fillText(item.label, 0, 0);
      } else {
        // 완전한 밤(가로 라벨, 넓은 중앙 구간) — 가장 넓으므로 폰트를 키운다.
        ctx.font = `20px ${KOREAN_FONT_STACK}`;
        ctx.fillText(item.label, centerX, centerY);
      }
      ctx.restore();
    }
    ctx.restore();
  },
};
Chart.register(shadeLabelPlugin);

/** shadeLabelPlugin에 전달하는 그리기 항목(1개 음영 box의 라벨 정보). */
interface ShadeLabelItem {
  xMin: number;
  xMax: number;
  label: string;
  placement: LabelPlacement;
}

/** 한글 글리프를 지원하는 공통 폰트 스택(canvas 커스텀 텍스트용). */
const KOREAN_FONT_STACK = '"Apple SD Gothic Neo", "Malgun Gothic", system-ui, -apple-system, sans-serif';

/** 다크 배경 대비용 색 팔레트(범례·축). */
const COLORS = {
  moon: '#ffd54a',
  cloud: '#5aa9ff',
  /** 구름 선·채움 테두리(회색 계열). */
  cloudLine: '#b4bcc9',
  grid: 'rgba(154,166,192,0.15)',
  text: '#e8ecf5',
  /** 음영 라벨 텍스트(어두운 음영 위에서도 판독 가능한 밝은 톤). */
  shadeLabel: 'rgba(255,255,255,0.7)',
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 박명/완전한 밤 음영의 "하늘 밝기" 불투명도.
 *
 * 근본 수정: 종전엔 배경(#0b1020)과 거의 같은 어두운 남색(rgba(22,27,54))에
 * alpha만 달리해, 어두운 배경 위에 어두운 색을 얹은 꼴이라 전부 새까맣게
 * 보여 구분이 전혀 안 됐다. 이제 실제 하늘처럼 **밝은 파란빛**(shadeColor)에
 * 불투명도를 달리한다: 해가 덜 진 시민박명이 가장 밝고(불투명도 최대),
 * 완전한 밤으로 갈수록 투명해져 배경의 검정으로 사라진다. 결과적으로
 * 밝은 파랑 가장자리 → 검은 중앙의 뚜렷한 그라데이션이 생긴다.
 */
const SHADE_ALPHA = {
  civil: 0.55,
  nautical: 0.4,
  astronomical: 0.28,
  fullDark: 0.12,
} as const;

/**
 * 박명 종류별 기준 색(RGB). 실제 노을처럼 해에 가까운 시민박명은 주황,
 * 멀어질수록 파랑으로, 완전한 밤은 깊은 남색으로 자연스럽게 섞인다:
 * 시민(주황) → 항해(주황·파랑 혼합=보라톤) → 천문(파랑) → 완전한 밤(남색).
 */
const SHADE_RGB = {
  civil: '232,140,70',
  nautical: '150,120,180',
  astronomical: '80,120,215',
  fullDark: '30,42,85',
} as const;

/** 음영 box 배경색(kind별 노을→밤 램프 색에 불투명도 차등). */
function shadeColor(kind: keyof typeof SHADE_RGB, alpha: number): string {
  return `rgba(${SHADE_RGB[kind]},${alpha})`;
}

/** 음영 box 식별자 → 표시 라벨. */
const SHADE_LABEL = {
  civil: '시민박명',
  nautical: '항해박명',
  astronomical: '천문박명',
  fullDark: '완전한 밤',
} as const;

/** 한 밴드(겹치지 않는 구간) 음영 box(ms epoch 경계). */
export interface AnnotationBox {
  /** 저녁(evening) 쪽과 새벽(morning) 쪽을 구분하는 고유 id. fullDark는 하나뿐. */
  id: string;
  /** 어떤 박명 종류인지(라벨·레이어 결정용). civil|nautical|astronomical|fullDark. */
  kind: keyof typeof SHADE_LABEL;
  xMin: number;
  xMax: number;
  /** 배경 alpha(농도 차등). */
  alpha: number;
  color: string;
  label: string;
}

function parseMs(iso: string | null): number | null {
  if (iso === null) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * epoch ms(UTC 기준 밀리초)를 KST 벽시계 "HH:MM" 문자열로 변환한다(표시 전용).
 * 계산용 epoch와 표시용 시각을 분리하기 위한 순수 함수(2번). 입력이 유효하지
 * 않으면 빈 문자열을 반환한다.
 */
export function formatKstHourMinute(epochMs: number): string {
  if (!Number.isFinite(epochMs)) return '';
  const kst = new Date(epochMs + KST_OFFSET_MS);
  const hh = kst.getUTCHours().toString().padStart(2, '0');
  const mm = kst.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * 박명 3종 + 완전한 밤의 음영 box를 **겹치지 않는 7개 밴드**로 만든다.
 *
 * civilTwilight.start는 "일몰(0도)부터 -6도까지 내려가는 교차 시각"이고,
 * nauticalTwilight.start는 "0도부터 -12도까지", astronomicalTwilight.start는
 * "0도부터 -18도까지"다 — 즉 세 값 모두 **일몰을 공통 기준으로 하는 서로
 * 다른 교차점**이라 그 자체로 이미 겹치지 않고 시간순으로 떨어져 있다
 * (civil.start < nautical.start < astronomical.start = fullDarkStart).
 * 따라서 각 박명 밴드는 "그 앞 단계의 교차 시각 ~ 그 박명 자신의 교차
 * 시각"이다:
 *
 *   1. evening-civil:        nightStartMs(일몰) ~ civil.start        (0~6도)
 *   2. evening-nautical:     civil.start        ~ nautical.start     (6~12도)
 *   3. evening-astronomical: nautical.start     ~ astronomical.start (12~18도,
 *                              = fullDarkStart와 동일한 끝점)
 *   4. fullDark:              fullDarkStart      ~ fullDarkEnd
 *   5. morning-astronomical:  fullDarkEnd        ~ nautical.end
 *   6. morning-nautical:      nautical.end       ~ civil.end
 *   7. morning-civil:         civil.end          ~ nightEndMs(일출)
 *
 * 각 경계 중 하나라도 null이면 그 밴드는 생략한다(§4-5 null 규칙 유지).
 * 저녁 쪽이 먼저, 새벽 쪽이 나중에 오도록 시간순으로 정렬한다.
 */
export function buildAnnotations(
  astro: AstronomyResult,
  nightStartMs: number,
  nightEndMs: number,
): AnnotationBox[] {
  const civilStart = parseMs(astro.civilTwilight.start);
  const civilEnd = parseMs(astro.civilTwilight.end);
  const nauticalStart = parseMs(astro.nauticalTwilight.start);
  const nauticalEnd = parseMs(astro.nauticalTwilight.end);
  const astroStart = parseMs(astro.astronomicalTwilight.start);
  const fullDarkStart = parseMs(astro.fullDarkStart);
  const fullDarkEnd = parseMs(astro.fullDarkEnd);

  const boxes: AnnotationBox[] = [];
  const add = (
    id: string,
    kind: keyof typeof SHADE_LABEL,
    xMin: number | null,
    xMax: number | null,
  ): void => {
    if (xMin === null || xMax === null || xMin >= xMax) {
      return; // 경계 미성립, 역전, 또는 폭 0 → 밴드 생략.
    }
    const alpha = SHADE_ALPHA[kind];
    boxes.push({ id, kind, xMin, xMax, alpha, color: shadeColor(kind, alpha), label: SHADE_LABEL[kind] });
  };

  add('evening-civil', 'civil', nightStartMs, civilStart);
  add('evening-nautical', 'nautical', civilStart, nauticalStart);
  add('evening-astronomical', 'astronomical', nauticalStart, astroStart);
  add('fullDark', 'fullDark', fullDarkStart, fullDarkEnd);
  add('morning-astronomical', 'astronomical', fullDarkEnd, nauticalEnd);
  add('morning-nautical', 'nautical', nauticalEnd, civilEnd);
  add('morning-civil', 'civil', civilEnd, nightEndMs);

  boxes.sort((a, b) => a.xMin - b.xMin);
  return boxes;
}

/** 월출/월몰 세로선 한 개(ms epoch 위치). */
export interface MoonMarker {
  id: 'moonrise' | 'moonset';
  x: number;
  label: string;
}

/** 월출/월몰 마커 색(달 곡선과 동일 계열이되 선으로 구분되는 톤). */
const MOON_MARKER_COLOR = '#ffb020';

/**
 * 월출/월몰 세로선 목록을 만든다(2-1번: 세로축 선 추가). 각각 null이면
 * 생략한다(월출/월몰이 "그날 밤" 범위 밖이거나 성립하지 않는 경우).
 */
export function buildMoonMarkers(astro: AstronomyResult): MoonMarker[] {
  const markers: MoonMarker[] = [];
  const riseMs = parseMs(astro.moonrise);
  if (riseMs !== null) {
    markers.push({ id: 'moonrise', x: riseMs, label: '월출' });
  }
  const setMs = parseMs(astro.moonset);
  if (setMs !== null) {
    markers.push({ id: 'moonset', x: setMs, label: '월몰' });
  }
  return markers;
}

/** 일몰/일출 마커 한 개(ms epoch 위치). */
export interface SunMarker {
  id: 'sunset' | 'sunrise';
  x: number;
  label: string;
}

/** 일몰/일출 마커 색(태양 기준 — 따뜻한 주황 톤). */
const SUN_MARKER_COLOR = '#ff8c42';

/**
 * 일몰(밤 시작)·일출(밤 끝) 세로선 목록을 만든다. astro.nightStart/nightEnd
 * (실제 일몰~일출 범위)를 쓴다. 파싱 불가하면 해당 선을 생략한다.
 */
export function buildSunMarkers(astro: AstronomyResult): SunMarker[] {
  const markers: SunMarker[] = [];
  const sunsetMs = parseMs(astro.nightStart);
  if (sunsetMs !== null) {
    markers.push({ id: 'sunset', x: sunsetMs, label: '일몰' });
  }
  const sunriseMs = parseMs(astro.nightEnd);
  if (sunriseMs !== null) {
    markers.push({ id: 'sunrise', x: sunriseMs, label: '일출' });
  }
  return markers;
}

/**
 * 박명 box 라벨 배치 전략(겹치지 않는 7밴드 기준).
 *
 * - 시민·항해·천문박명(civil/nautical/astronomical): 모두 세로로 세운다.
 *   저녁쪽 밴드는 90도, 새벽쪽 밴드는 270도(=-90도)로 회전해 좌우 대칭이
 *   되게 한다. 자간은 그리기 단계(shadeLabelPlugin)에서 넓힌다.
 * - 완전한 밤(fullDark): 가장 넓은 중앙 구간 → 가로 텍스트.
 */
export type LabelPlacement =
  | { kind: 'vertical'; rotationDeg: -90 | 90 }
  | { kind: 'horizontal' };

/**
 * 밴드 id(evening- 또는 morning- 접두사, fullDark)와 kind로 라벨 배치를
 * 결정한다. id의 저녁/새벽 접두사로 직접 좌우를 판정한다.
 */
export function labelPlacementFor(id: string, kind: keyof typeof SHADE_LABEL): LabelPlacement {
  if (kind === 'civil' || kind === 'nautical' || kind === 'astronomical') {
    const rotationDeg = id.startsWith('morning-') ? 90 : -90;
    return { kind: 'vertical', rotationDeg };
  }
  return { kind: 'horizontal' };
}

/**
 * buildAnnotations 결과로부터 shadeLabelPlugin에 전달할 라벨 항목을
 * 만든다. 순수 함수.
 */
export function buildShadeLabelItems(
  astro: AstronomyResult,
  nightStartMs: number,
  nightEndMs: number,
): ShadeLabelItem[] {
  return buildAnnotations(astro, nightStartMs, nightEndMs).map((box) => ({
    xMin: box.xMin,
    xMax: box.xMax,
    label: box.label,
    placement: labelPlacementFor(box.id, box.kind),
  }));
}

/**
 * 달 체감 밝기 시간별 꺾은선 점 목록을 만든다(5번). `astro.moonHourly`를
 * { x: epoch ms, y: 상대 밝기% }로 변환한다. 순수 함수.
 */
export function buildMoonCurve(astro: AstronomyResult): Array<{ x: number; y: number }> {
  return astro.moonHourly
    .map((h) => ({ x: Date.parse(h.hourKst), y: h.relativeBrightnessPct }))
    .filter((p) => !Number.isNaN(p.x));
}

/** x축 고정 틱 간격(ms). 1시간 단위 — 자동 틱의 들쭉날쭉함을 없앤다(2-5번). */
const TICK_STEP_MS = 60 * 60 * 1000;

/**
 * [nightStartMs, nightEndMs] 구간을 KST 정시(매 시 00분) 기준 1시간 간격으로
 * 끊어 틱 위치(epoch ms) 배열을 만든다(2-5번: "왜 저 시간들인지 모호함"
 * 보완 — 항상 정시 간격으로 고정해 예측 가능하게 한다). 순수 함수.
 */
export function buildHourlyTicks(nightStartMs: number, nightEndMs: number): number[] {
  if (!Number.isFinite(nightStartMs) || !Number.isFinite(nightEndMs) || nightStartMs >= nightEndMs) {
    return [];
  }
  // KST 벽시계 기준 정시로 맞춘다: epoch ms + KST 오프셋을 1시간 단위로 올림.
  const kstMs = nightStartMs + KST_OFFSET_MS;
  const firstKstHourMs = Math.ceil(kstMs / TICK_STEP_MS) * TICK_STEP_MS;
  const firstTickMs = firstKstHourMs - KST_OFFSET_MS;

  const ticks: number[] = [];
  for (let t = firstTickMs; t <= nightEndMs; t += TICK_STEP_MS) {
    ticks.push(t);
  }
  return ticks;
}

/**
 * Chart.js 구성을 만든다(순수). 구름 데이터셋은 known일 때만 포함하고
 * 우축도 known일 때만 표시한다. x축 눈금은 KST "HH:MM"로 포맷하고(2번),
 * 1시간 고정 간격으로 생성한다(2-5번).
 */
export function buildChartConfig(
  astro: AstronomyResult,
  cloud: CloudForecast,
  nightStartMs: number,
  nightEndMs: number,
  /** 초기 표시 x 창(좁은 화면에서 일부만 보이고 pan으로 나머지를 본다). 미지정 시 전체. */
  viewStartMs: number = nightStartMs,
  viewEndMs: number = nightEndMs,
): ChartConfiguration<'line'> {
  const moonCurve = buildMoonCurve(astro);
  const isKnown = cloud.status === 'known' && cloud.hourlyCloudPct !== null;

  const datasets: ChartConfiguration<'line'>['data']['datasets'] = [
    {
      label: '달 체감 밝기(피크=달 조도%)',
      data: moonCurve,
      borderColor: COLORS.moon,
      // 곡선 아래를 노랑 5% 투명도로 옅게 채운다.
      backgroundColor: 'rgba(255,213,74,0.05)',
      yAxisID: 'yMoon',
      pointRadius: 0,
      borderWidth: 2,
      tension: 0.3,
      fill: true,
    },
  ];

  if (isKnown) {
    const cloudPoints = (cloud.hourlyCloudPct ?? []).map((h) => ({
      x: Date.parse(h.hourKst),
      y: h.cloudPct,
    }));
    datasets.push({
      label: '구름량',
      data: cloudPoints,
      borderColor: COLORS.cloudLine,
      // 구름 영역은 회색 계열로 옅게 채운다(불투명도 0.1).
      backgroundColor: 'rgba(150,158,170,0.1)',
      yAxisID: 'yCloud',
      pointRadius: 0,
      borderWidth: 2,
      fill: true,
    });
  }

  const annotations: Record<string, object> = {};
  for (const box of buildAnnotations(astro, nightStartMs, nightEndMs)) {
    // 라벨은 annotation 플러그인이 아니라 shadeLabelPlugin(커스텀)이
    // 픽셀 단위로 직접 그린다(2-2-1번: 정확한 대각선 각도·세로 회전을
    // annotation의 고정 rotation 숫자만으로는 표현할 수 없었음). box는
    // 음영만 담당한다.
    annotations[box.id] = {
      type: 'box',
      xMin: box.xMin,
      xMax: box.xMax,
      backgroundColor: box.color,
      borderWidth: 0,
    };
  }

  // 세로선 라벨을 상단에 칩(배경+패딩) 형태로 붙이는 공통 스타일.
  const topChipLabel = (content: string, color: string): object => ({
    display: true,
    content,
    color,
    position: 'end', // 세로선의 위쪽 끝(차트 상단).
    yAdjust: 10, // 상단에서 살짝 내려 마진(패딩 포함 칩이 상단 경계에 겹치지 않게).
    backgroundColor: 'rgba(11,16,32,0.8)',
    borderColor: color,
    borderWidth: 1,
    borderRadius: 5,
    padding: { x: 5, y: 2 },
    font: { size: 9, weight: 'bold' },
  });

  // (2-1번) 월출/월몰 세로선 — 어느 시점에 뜨고 지는지 한눈에 보이게 한다.
  for (const marker of buildMoonMarkers(astro)) {
    annotations[marker.id] = {
      type: 'line',
      xMin: marker.x,
      xMax: marker.x,
      borderColor: MOON_MARKER_COLOR,
      borderWidth: 2,
      borderDash: [6, 4],
      label: topChipLabel(marker.label, MOON_MARKER_COLOR),
    };
  }

  // 일몰(밤 시작)·일출(밤 끝) 세로선 — 밤 범위 양 끝을 태양 기준으로 표시.
  for (const sun of buildSunMarkers(astro)) {
    annotations[sun.id] = {
      type: 'line',
      xMin: sun.x,
      xMax: sun.x,
      borderColor: SUN_MARKER_COLOR,
      borderWidth: 2,
      borderDash: [2, 3],
      label: topChipLabel(sun.label, SUN_MARKER_COLOR),
    };
  }

  return {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      scales: {
        x: {
          type: 'linear',
          min: viewStartMs,
          max: viewEndMs,
          grid: { color: COLORS.grid },
          // (2-5번) 자동 틱 대신 KST 정시 1시간 고정 간격으로 눈금을 둬
          // "왜 저 시간대만 나오는지" 모호하지 않게 한다.
          afterBuildTicks: (axis) => {
            axis.ticks = buildHourlyTicks(nightStartMs, nightEndMs).map((value) => ({ value }));
          },
          ticks: {
            color: COLORS.text,
            // (2번) epoch ms → KST "HH:MM". 원본 epoch 숫자 노출 금지.
            callback: (value) => formatKstHourMinute(Number(value)),
          },
        },
        yMoon: {
          position: 'left',
          min: 0,
          max: 100,
          title: { display: true, text: '달 밝기 %(피크=달 조도)', color: COLORS.text },
          grid: { color: COLORS.grid },
          ticks: { color: COLORS.text },
        },
        yCloud: {
          position: 'right',
          min: 0,
          max: 100,
          display: isKnown,
          title: { display: true, text: '구름량 %', color: COLORS.text },
          grid: { drawOnChartArea: false },
          ticks: { color: COLORS.text },
        },
      },
      plugins: {
        legend: { labels: { color: COLORS.text } },
        annotation: { annotations },
      },
    },
  };
}

/**
 * 단일 Chart 인스턴스를 관리하는 래퍼. 날짜 전환 시 render가 기존 인스턴스의
 * data/options를 갱신하고 update()만 호출한다(destroy/재생성 아님, PD4).
 */
export class NightChart {
  private chart: Chart<'line'> | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  /**
   * 주어진 밤의 구성으로 그리거나(최초) 갱신한다(PD4).
   *
   * viewStartMs/viewEndMs를 주면 그 창만 먼저 보여주고 나머지는 pan으로
   * 넘겨 본다(좁은 화면 가독성). 미지정 시 밤 전체를 표시한다.
   */
  render(
    astro: AstronomyResult,
    cloud: CloudForecast,
    nightStartMs: number,
    nightEndMs: number,
    viewStartMs?: number,
    viewEndMs?: number,
  ): void {
    const config = buildChartConfig(
      astro,
      cloud,
      nightStartMs,
      nightEndMs,
      viewStartMs,
      viewEndMs,
    );
    const shadeLabels = buildShadeLabelItems(astro, nightStartMs, nightEndMs);
    if (this.chart === null) {
      this.chart = new Chart(this.canvas, config);
      (this.chart as unknown as { $shadeLabels?: ShadeLabelItem[] }).$shadeLabels = shadeLabels;
      return;
    }
    this.chart.data = config.data;
    this.chart.options = config.options ?? {};
    (this.chart as unknown as { $shadeLabels?: ShadeLabelItem[] }).$shadeLabels = shadeLabels;
    this.chart.update();
  }

  /** 명시적 폐기(화면 떠날 때). */
  destroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
