/**
 * 메인 목록 화면 (WF1, FR1.x·FR2.1, US1.x, AC1.x·AC2.1.x).
 *
 * 스켈레톤 → listCandidateDates → 날짜별 NightView를 Promise.all로 병렬
 * 조립(PD2) → 연휴 카드 렌더(날짜·연휴명, 달 아이콘+조도%, 구름 요약/안내)
 * → 추천 강조(recommendationView) → 카드 탭 시 상세 라우팅. 빈 목록 안내.
 *
 * 안전 렌더(NFR6.2/SD2): 모든 사용자 노출 텍스트는 textContent로만 바인딩하고
 * innerHTML을 사용하지 않는다. 다크모드·모바일 우선 레이아웃.
 */

import { listCandidateDates } from '../domain-rules/index.js';
import type { DataCache } from '../weather/index.js';
import { assembleNightView, type AssembleContext } from './assembler.js';
import { cloudStatusText } from './state.js';
import { toRecommendationView } from './recommendationView.js';
import { averageCloudPct } from './cloudSummary.js';
import { type CalendarDate, type NightView } from './types.js';

/** 목록 화면 조립 입력. */
export interface ListViewContext {
  /** 세션 공유 캐시(PD3). */
  cache: DataCache;
  /** 기준 시각(epoch ms). */
  nowMs: number;
  /** 조회 시작 KST 날짜 키(오늘). */
  fromKstId: string;
  /** 조회 개월 수(FR1.1, >= 3). */
  months: number;
}

/** 달 위상 아이콘(조도 기반 단순 매핑, 색 비의존 보조 형태). */
export function moonPhaseIcon(illuminationPct: number): string {
  if (illuminationPct <= 5) return '🌑';
  if (illuminationPct <= 35) return '🌒';
  if (illuminationPct <= 65) return '🌓';
  if (illuminationPct <= 95) return '🌔';
  return '🌕';
}

function el(tag: string, className?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className !== undefined) {
    node.className = className;
  }
  return node;
}

function setText(node: HTMLElement, text: string): void {
  // 안전 렌더: 텍스트 바인딩만 사용(innerHTML 금지, NFR6.2).
  node.textContent = text;
}

/** 로딩 스켈레톤 카드들을 렌더한다(AC1.1.3). */
function renderSkeleton(root: HTMLElement): void {
  root.replaceChildren();
  const list = el('div', 'night-list');
  list.setAttribute('data-testid', 'list-loading');
  for (let i = 0; i < 4; i += 1) {
    const card = el('div', 'night-card skeleton');
    card.setAttribute('data-testid', 'skeleton-card');
    list.appendChild(card);
  }
  root.appendChild(list);
}

/** 빈 목록 안내를 렌더한다(AC1.2.2). */
function renderEmpty(root: HTMLElement): void {
  root.replaceChildren();
  const empty = el('div', 'empty-state');
  empty.setAttribute('data-testid', 'empty-state');
  setText(empty, '표시할 날짜가 없어요');
  root.appendChild(empty);
}

/** 한 밤의 구름 요약/안내 문구를 만든다(known이면 평균 요약, 그 외 중립 안내). */
function cloudSummaryText(night: NightView): string {
  const statusText = cloudStatusText(night.cloud);
  if (statusText !== null) {
    return statusText; // outOfHorizon 안내 또는 unknown "알 수 없음"
  }
  const avg = averageCloudPct(night.cloud);
  return avg === null ? '구름량 알 수 없음' : `구름 ${avg}%`;
}

/** 한 NightView를 카드로 렌더한다. */
function renderCard(night: NightView, onOpen: (dateKstId: string) => void): HTMLElement {
  const card = el('div', 'night-card');
  card.setAttribute('data-testid', `night-card-${night.dateKstId}`);
  card.setAttribute('role', 'button');
  card.tabIndex = 0;

  const rec = toRecommendationView(night.verdict);
  if (rec.yellowBorder) {
    card.classList.add('recommended');
    card.setAttribute('data-recommended', 'true');
  }

  // 헤더: 날짜/연휴명 + (추천 시) 별 아이콘·라벨(색 비의존).
  const header = el('div', 'card-header');
  const title = el('span', 'card-title');
  setText(title, `${night.calendar.dateKstId} · ${night.calendar.label}`);
  header.appendChild(title);
  if (rec.starIcon) {
    const badge = el('span', 'recommend-badge');
    badge.setAttribute('data-testid', `recommend-badge-${night.dateKstId}`);
    setText(badge, `⭐ ${rec.label}`);
    header.appendChild(badge);
  }
  card.appendChild(header);

  // 달 위상 아이콘 + 조도%.
  const moon = el('div', 'card-moon');
  if (night.astro !== null) {
    setText(
      moon,
      `${moonPhaseIcon(night.astro.moonIlluminationPct)} 달 밝기 ${Math.round(night.astro.moonIlluminationPct)}%`,
    );
  } else {
    setText(moon, '천문 정보를 불러오지 못했어요');
  }
  card.appendChild(moon);

  // 구름 요약/안내.
  const cloud = el('div', 'card-cloud');
  cloud.setAttribute('data-testid', `cloud-summary-${night.dateKstId}`);
  setText(cloud, cloudSummaryText(night));
  card.appendChild(cloud);

  // error 카드는 축약 에러 + 재시도(상세와 동일 WF3; 여기선 상세로 이동해 재시도).
  if (night.state === 'error') {
    const err = el('div', 'card-error');
    setText(err, '천문 계산 실패 — 눌러서 다시 시도');
    card.appendChild(err);
  }

  const open = (): void => onOpen(night.dateKstId);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
  return card;
}

/**
 * 메인 목록을 조립·렌더한다(WF1).
 *
 * @param root 렌더 대상 컨테이너.
 * @param ctx 조회 범위·공유 캐시·기준 시각.
 * @param onOpen 카드 탭 시 상세 라우팅 콜백(dateKstId 전달).
 */
export async function renderListView(
  root: HTMLElement,
  ctx: ListViewContext,
  onOpen: (dateKstId: string) => void,
): Promise<void> {
  renderSkeleton(root);

  const dates: CalendarDate[] = listCandidateDates({
    fromKstId: ctx.fromKstId,
    months: ctx.months,
  });
  if (dates.length === 0) {
    renderEmpty(root);
    return;
  }

  const assembleCtx: AssembleContext = { cache: ctx.cache, nowMs: ctx.nowMs };
  // U2 호출은 병렬(Promise.all)로 모아 체감 로딩을 단축한다(PD2/NFR3).
  const views = await Promise.all(dates.map((d) => assembleNightView(d, assembleCtx)));

  root.replaceChildren();
  const list = el('div', 'night-list');
  list.setAttribute('data-testid', 'night-list');
  for (const view of views) {
    list.appendChild(renderCard(view, onOpen));
  }
  root.appendChild(list);
}
