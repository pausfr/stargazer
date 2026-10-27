/**
 * Step 14(일부) — 상세 요약 순수 표시 매핑 테스트 (AC3.2.1·AC3.2.3).
 *
 * 월출·월몰·완전한 밤 경계 null → "없음" 명시 표기, KST HH:MM 변환을
 * 검증한다. Chart.js 그리기는 제외(수동 스모크).
 */

import { describe, it, expect } from 'vitest';
import {
  toNightSummaryView,
  formatKstTime,
  MOONRISE_NONE_TEXT,
  MOONSET_NONE_TEXT,
  FULLDARK_NONE_TEXT,
} from '../summaryView.js';
import { makeAstro } from './fixtures.js';

describe('formatKstTime', () => {
  it('KST ISO에서 HH:MM을 뽑는다(타임존 변환 없이 벽시계 시각)', () => {
    expect(formatKstTime('2026-01-01T18:30:00+09:00')).toBe('18:30');
    expect(formatKstTime('2026-01-02T05:05:00+09:00')).toBe('05:05');
  });

  it('파싱 불가 입력은 원본을 둔다', () => {
    expect(formatKstTime('not-a-time')).toBe('not-a-time');
  });
});

describe('toNightSummaryView', () => {
  it('모든 값 존재: HH:MM 표기와 조도%', () => {
    const view = toNightSummaryView(makeAstro({ moonIlluminationPct: 41.6 }));
    expect(view.hasFullDark).toBe(true);
    expect(view.fullDarkStartText).toBe('19:03');
    expect(view.fullDarkEndText).toBe('05:28');
    expect(view.moonriseText).toBe('20:00');
    expect(view.moonsetText).toBe('07:00');
    expect(view.moonIlluminationText).toBe('42%');
  });

  it('moonrise null → "-"만(라벨 중복 없음, 3번 회귀)', () => {
    const view = toNightSummaryView(makeAstro({ moonrise: null }));
    expect(view.moonriseText).toBe(MOONRISE_NONE_TEXT);
    expect(view.moonriseText).toBe('-');
  });

  it('moonset null → "-"만', () => {
    const view = toNightSummaryView(makeAstro({ moonset: null }));
    expect(view.moonsetText).toBe(MOONSET_NONE_TEXT);
    expect(view.moonsetText).toBe('-');
  });

  it('완전한 밤 경계 null → "-"만, hasFullDark=false', () => {
    const view = toNightSummaryView(makeAstro({ fullDarkStart: null, fullDarkEnd: null }));
    expect(view.hasFullDark).toBe(false);
    expect(view.fullDarkStartText).toBe(FULLDARK_NONE_TEXT);
    expect(view.fullDarkStartText).toBe('-');
    expect(view.fullDarkEndText).toBe('-');
  });
});
