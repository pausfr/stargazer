/**
 * 상세 그래프 화면 (WF2·WF3, FR3.x·FR6.x, US3.x·US4.2, AC3.x·AC4.2).
 *
 * 로딩 → NightView 조립 → astro 실패 시 에러+재시도(WF3) → 이중축 차트
 * (chart.ts) → 핵심 숫자 요약(완전한 밤·월출·월몰; null이면 "없음" 명시,
 * AC3.2.3) → 범례 → 뒤로가기(history). 이전/다음 연휴 바로가기 버튼 없음
 * (AC3.3.2). outOfHorizon이면 "날씨는 날짜가 가까워지면" 안내.
 *
 * 안전 렌더(NFR6.2): 모든 텍스트는 textContent로만 바인딩(innerHTML 금지).
 */

import { listCandidateDates } from '../domain-rules/index.js';
import type { DataCache } from '../weather/index.js';
import { assembleNightView, type AssembleContext } from './assembler.js';
import { NightChart } from './chart.js';
import { CLOUD_FAR_DATE_TEXT, CLOUD_UNKNOWN_TEXT } from './state.js';
import { toNightSummaryView } from './summaryView.js';
import { type CalendarDate, type NightView } from './types.js';

/** 상세 화면 컨텍스트. */
export interface DetailViewContext {
  cache: DataCache;
  nowMs: number;
  /** 목록 조회에 쓴 것과 동일한 시작일/개월(해당 CalendarDate 재확보용). */
  fromKstId: string;
  months: number;
}

function el(tag: string, className?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className !== undefined) node.className = className;
  return node;
}
function setText(node: HTMLElement, text: string): void {
  node.textContent = text; // 안전 렌더(innerHTML 금지, NFR6.2).
}



/** dateKstId에 해당하는 CalendarDate를 재확보한다(목록과 동일 범위). */
export function findCalendarDate(ctx: DetailViewContext, dateKstId: string): CalendarDate | null {
  const dates = listCandidateDates({ fromKstId: ctx.fromKstId, months: ctx.months });
  return dates.find((d) => d.dateKstId === dateKstId) ?? null;
}

function renderLoading(root: HTMLElement): void {
  root.replaceChildren();
  const box = el('div', 'detail-loading');
  box.setAttribute('data-testid', 'detail-loading');
  setText(box, '불러오는 중…');
  root.appendChild(box);
}

function renderBackButton(onBack: () => void): HTMLElement {
  const back = el('button', 'back-button');
  back.setAttribute('data-testid', 'back-button');
  setText(back, '← 뒤로');
  back.addEventListener('click', onBack);
  return back;
}

/** 천문 실패 화면 + 재시도(WF3, AC4.2.1·4.2.2). */
function renderError(root: HTMLElement, onRetry: () => void, onBack: () => void): void {
  root.replaceChildren();
  root.appendChild(renderBackButton(onBack));
  const box = el('div', 'detail-error');
  box.setAttribute('data-testid', 'detail-error');
  const msg = el('p', 'error-message');
  setText(msg, '천문 정보를 불러오지 못했어요.');
  const retry = el('button', 'retry-button');
  retry.setAttribute('data-testid', 'retry-button');
  setText(retry, '다시 시도');
  retry.addEventListener('click', onRetry);
  box.appendChild(msg);
  box.appendChild(retry);
  root.appendChild(box);
}

/** 핵심 숫자 요약을 렌더한다(null → "없음" 명시, AC3.2.3). */
function renderSummary(container: HTMLElement, night: NightView): void {
  if (night.astro === null) return;
  const summary = toNightSummaryView(night.astro);
  const box = el('div', 'night-summary');
  box.setAttribute('data-testid', 'night-summary');

  const rows: Array<[string, string, string]> = [
    ['moon-illumination', '달 위상', summary.moonIlluminationText],
    [
      'full-dark',
      '완전한 밤',
      summary.hasFullDark
        ? `${summary.fullDarkStartText} ~ ${summary.fullDarkEndText}`
        : summary.fullDarkStartText,
    ],
    ['moonrise', '월출', summary.moonriseText],
    ['moonset', '월몰', summary.moonsetText],
  ];
  for (const [id, label, value] of rows) {
    const row = el('div', 'summary-row');
    row.setAttribute('data-testid', `summary-${id}`);
    const k = el('span', 'summary-label');
    setText(k, label);
    const v = el('span', 'summary-value');
    setText(v, value);
    row.appendChild(k);
    row.appendChild(v);
    box.appendChild(row);
  }
  container.appendChild(box);
}

/** 범례(선·음영 의미, AC3.2.2). */
function renderLegend(container: HTMLElement, cloudKnown: boolean): void {
  const legend = el('div', 'chart-legend');
  legend.setAttribute('data-testid', 'chart-legend');
  const items = [
    '달 체감 밝기: 시간별 곡선(피크=달 조도%)',
    ...(cloudKnown ? ['구름량: 시간별 곡선'] : []),
    '음영: 박명(시민·항해·천문, 어두울수록 진함)',
    '진한 음영: 완전한 밤',
  ];
  for (const text of items) {
    const item = el('div', 'legend-item');
    setText(item, text);
    legend.appendChild(item);
  }
  container.appendChild(legend);
}

/** 정상 상세 본문을 렌더한다(차트 + 요약 + 범례 + 상태 안내). */
function renderDetail(root: HTMLElement, night: NightView, onBack: () => void): void {
  root.replaceChildren();
  root.appendChild(renderBackButton(onBack));

  const content = el('div', 'detail-content');
  content.setAttribute('data-testid', 'detail-content');

  // 헤더.
  const title = el('h2', 'detail-title');
  setText(title, `${night.calendar.dateKstId} · ${night.calendar.label}`);
  content.appendChild(title);

  // partial(구름 unknown) 안내.
  if (night.state === 'partial') {
    const notice = el('div', 'cloud-notice partial');
    notice.setAttribute('data-testid', 'partial-notice');
    setText(notice, CLOUD_UNKNOWN_TEXT);
    content.appendChild(notice);
  }
  // outOfHorizon("먼 날짜") 안내.
  if (night.cloud.status === 'outOfHorizon') {
    const notice = el('div', 'cloud-notice far-date');
    notice.setAttribute('data-testid', 'far-date-notice');
    setText(notice, CLOUD_FAR_DATE_TEXT);
    content.appendChild(notice);
  }

  // 차트 캔버스(실제 그리기는 수동 스모크; 조립 시 NightChart.render).
  // 차트는 밤 전체(일몰~일출)를 고정 표시한다(드래그/스크롤 없음).
  const chartWrap = el('div', 'chart-wrap');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-testid', 'night-chart');
  chartWrap.appendChild(canvas);
  content.appendChild(chartWrap);

  if (night.astro !== null) {
    // 차트 x축은 실제 일몰~일출(astro.nightStart/nightEnd)을 쓴다. calendar의
    // 고정 18:00~06:00을 쓰면 바깥쪽 시민박명 밴드가 잘렸다(일몰~일출 확장).
    const nightStartMs = Date.parse(night.astro.nightStart);
    const nightEndMs = Date.parse(night.astro.nightEnd);
    try {
      new NightChart(canvas as HTMLCanvasElement).render(
        night.astro,
        night.cloud,
        nightStartMs,
        nightEndMs,
      );
    } catch {
      // 렌더 환경(테스트 등)에서 canvas 컨텍스트가 없을 수 있다 — 표시 요약은 계속.
    }
  }

  renderSummary(content, night);
  renderLegend(content, night.cloud.status === 'known');
  root.appendChild(content);
}

/**
 * 상세 화면을 조립·렌더한다(WF2). astro 실패면 에러+재시도(WF3).
 *
 * @param root 렌더 대상.
 * @param dateKstId 표시 대상 밤.
 * @param ctx 공유 캐시·기준 시각·조회 범위.
 * @param onBack 뒤로가기 콜백(history 기반).
 */
export async function renderDetailView(
  root: HTMLElement,
  dateKstId: string,
  ctx: DetailViewContext,
  onBack: () => void,
): Promise<void> {
  renderLoading(root);

  const calendar = findCalendarDate(ctx, dateKstId);
  if (calendar === null) {
    renderError(root, () => void renderDetailView(root, dateKstId, ctx, onBack), onBack);
    return;
  }

  const assembleCtx: AssembleContext = { cache: ctx.cache, nowMs: ctx.nowMs };
  const night = await assembleNightView(calendar, assembleCtx);

  if (night.state === 'error') {
    // WF3: 에러 상태에서 "다시 시도" → 동일 dateKstId 재조립.
    renderError(root, () => void renderDetailView(root, dateKstId, ctx, onBack), onBack);
    return;
  }

  renderDetail(root, night, onBack);
}
