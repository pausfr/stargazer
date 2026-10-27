/**
 * AppRoot — 앱 루트·라우팅·공유 상태 (functional-spec §5.1, logical-components).
 *
 * 공유 DataCache 단일 인스턴스(U2 타입)와 기준 시각 nowMs를 보유하고, 모든
 * getCloudForecast 호출에 주입한다(PD3 — 호출마다 새 캐시가 되지 않도록).
 * 해시 기반 라우팅(#/ 목록, #/night/:dateKstId 상세, 브라우저 뒤로가기)으로
 * 두 화면을 전환한다.
 */

import { DataCache } from '../weather/index.js';
import { renderListView, type ListViewContext } from './listView.js';
import { renderDetailView, type DetailViewContext } from './detailView.js';

/** 오늘 KST 날짜 키 YYYY-MM-DD를 만든다(조회 시작일). */
export function todayKstId(nowMs: number): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kst = new Date(nowMs + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 해시에서 라우트를 파싱한다. #/night/:dateKstId → detail, 그 외 → list. */
export function parseRoute(hash: string): { name: 'list' } | { name: 'detail'; dateKstId: string } {
  const m = /^#\/night\/([0-9]{4}-[0-9]{2}-[0-9]{2})$/.exec(hash);
  if (m !== null) {
    return { name: 'detail', dateKstId: m[1] };
  }
  return { name: 'list' };
}

export class AppRoot {
  /** 세션 공유 캐시 단일 인스턴스(PD3). */
  private readonly cache = new DataCache();
  /** 조회 개월 수(FR1.1). */
  private readonly months = 3;
  private readonly boundRoute = (): void => {
    void this.route();
  };

  constructor(
    private readonly mount: HTMLElement,
    /** 기준 시각 제공자(테스트 주입용, 기본 Date.now). */
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** 앱을 시작한다: 해시 변경 구독 + 최초 라우팅. */
  start(): void {
    window.addEventListener('hashchange', this.boundRoute);
    void this.route();
  }

  /** 구독 해제(테스트·정리용). */
  stop(): void {
    window.removeEventListener('hashchange', this.boundRoute);
  }

  private get fromKstId(): string {
    return todayKstId(this.now());
  }

  /** 현재 해시에 따라 화면을 렌더한다. */
  async route(): Promise<void> {
    const route = parseRoute(window.location.hash);
    const nowMs = this.now();
    if (route.name === 'detail') {
      const ctx: DetailViewContext = {
        cache: this.cache,
        nowMs,
        fromKstId: this.fromKstId,
        months: this.months,
      };
      await renderDetailView(this.mount, route.dateKstId, ctx, () => window.history.back());
      return;
    }
    const ctx: ListViewContext = {
      cache: this.cache,
      nowMs,
      fromKstId: this.fromKstId,
      months: this.months,
    };
    await renderListView(this.mount, ctx, (dateKstId) => {
      window.location.hash = `#/night/${dateKstId}`;
    });
  }
}
