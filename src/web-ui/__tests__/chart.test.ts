/**
 * Step 14(일부) — 차트 구성 순수 함수 테스트 (§2.1·§4, PD4 null 규칙).
 *
 * @vitest-environment happy-dom
 *
 * 재작업 반영:
 * - (5) 달 체감 밝기 시계열 꺾은선(buildMoonCurve) — 수평 기준선 아님.
 * - (2) X축 KST "HH:MM" 포맷(formatKstHourMinute)과 ticks.callback 적용.
 * - (7/8) 박명 음영 농도 차등(alpha)·구간 라벨 표시, null 경계 box 생략.
 * 실제 Chart.js 그리기는 제외(수동 스모크).
 */

import { describe, it, expect } from 'vitest';
import {
  buildAnnotations,
  buildMoonCurve,
  buildMoonMarkers,
  buildSunMarkers,
  buildHourlyTicks,
  labelPlacementFor,
  buildShadeLabelItems,
  buildChartConfig,
  formatKstHourMinute,
} from '../chart.js';
import { makeAstro, makeCloudKnown, makeCloudUnknown, makeCloudOutOfHorizon } from './fixtures.js';

// 밤 범위(일몰~일출)는 civilTwilight.start/end(가장 바깥 경계)보다 더 바깥쪽이어야
// 한다(evening-civil 밴드 = nightStartMs~civil.start가 양의 폭을 가지려면).
const NIGHT_START = Date.parse('2026-01-01T17:30:00+09:00');
const NIGHT_END = Date.parse('2026-01-02T07:01:00+09:00');

describe('formatKstHourMinute (2번: X축 KST HH:MM)', () => {
  it('epoch ms를 KST 벽시계 "HH:MM"으로 변환한다', () => {
    expect(formatKstHourMinute(Date.parse('2026-01-01T19:00:00+09:00'))).toBe('19:00');
    expect(formatKstHourMinute(Date.parse('2026-01-01T23:30:00+09:00'))).toBe('23:30');
    expect(formatKstHourMinute(Date.parse('2026-01-02T05:05:00+09:00'))).toBe('05:05');
  });

  it('유효하지 않은 입력은 빈 문자열', () => {
    expect(formatKstHourMinute(Number.NaN)).toBe('');
  });

  it('원본 epoch 숫자를 그대로 노출하지 않는다', () => {
    const out = formatKstHourMinute(1_793_523_600_000);
    expect(out).toMatch(/^\d{2}:\d{2}$/);
    expect(out).not.toContain('1793523600000');
  });
});

describe('buildMoonCurve (5번: 시간별 꺾은선)', () => {
  it('moonHourly를 { x: epoch ms, y: 상대 밝기% } 시계열로 변환한다', () => {
    const pts = buildMoonCurve(makeAstro());
    expect(pts.length).toBeGreaterThan(2);
    expect(pts[0]).toEqual({
      x: Date.parse('2026-01-01T18:00:00+09:00'),
      y: 0,
    });
    // 수평 기준선이 아니라 값이 변한다(남중 피크 100 포함).
    const ys = pts.map((p) => p.y);
    expect(Math.max(...ys)).toBe(100);
    expect(new Set(ys).size).toBeGreaterThan(1);
  });
});

describe('buildAnnotations (근본 재작업: 겹치지 않는 7밴드)', () => {
  it('모든 경계 존재 → 겹치지 않는 7개 밴드(저녁 3 + 완전한 밤 1 + 새벽 3)', () => {
    const boxes = buildAnnotations(makeAstro(), NIGHT_START, NIGHT_END);
    expect(boxes.map((b) => b.id).sort()).toEqual([
      'evening-astronomical',
      'evening-civil',
      'evening-nautical',
      'fullDark',
      'morning-astronomical',
      'morning-civil',
      'morning-nautical',
    ]);
  });

  it('밴드는 서로 겹치지 않고 시간순으로 이어진다(각 xMax가 다음 xMin과 같음)', () => {
    const boxes = buildAnnotations(makeAstro(), NIGHT_START, NIGHT_END); // 이미 xMin 기준 정렬.
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].xMin).toBe(boxes[i - 1].xMax);
    }
    // 첫 밴드는 밤 시작, 마지막 밴드는 밤 끝에서 맞닿는다.
    expect(boxes[0].xMin).toBe(NIGHT_START);
    expect(boxes[boxes.length - 1].xMax).toBe(NIGHT_END);
  });

  it('하늘 밝기(alpha)가 시민>항해>천문>완전한 밤 순으로 밝다(해가 덜 질수록 밝은 파랑)', () => {
    const boxes = buildAnnotations(makeAstro(), NIGHT_START, NIGHT_END);
    const byKind = Object.fromEntries(boxes.map((b) => [b.kind, b.alpha]));
    expect(byKind.civil).toBeGreaterThan(byKind.nautical);
    expect(byKind.nautical).toBeGreaterThan(byKind.astronomical);
    expect(byKind.astronomical).toBeGreaterThan(byKind.fullDark);
  });

  it('각 밴드가 전체 단어 표시 라벨을 가진다(시민박명·항해박명·천문박명·완전한 밤)', () => {
    const boxes = buildAnnotations(makeAstro(), NIGHT_START, NIGHT_END);
    const byId = Object.fromEntries(boxes.map((b) => [b.id, b.label]));
    expect(byId['evening-civil']).toBe('시민박명');
    expect(byId['morning-civil']).toBe('시민박명');
    expect(byId['evening-nautical']).toBe('항해박명');
    expect(byId['evening-astronomical']).toBe('천문박명');
    expect(byId.fullDark).toBe('완전한 밤');
  });

  it('완전한 밤 경계 null → fullDark 밴드 생략(나머지는 유지)', () => {
    const boxes = buildAnnotations(
      makeAstro({ fullDarkStart: null, fullDarkEnd: null }),
      NIGHT_START,
      NIGHT_END,
    );
    expect(boxes.find((b) => b.id === 'fullDark')).toBeUndefined();
    expect(boxes.find((b) => b.id === 'evening-civil')).toBeDefined();
  });

  it('완전한 밤 경계 null(천문박명 미성립) → fullDark·morning-astronomical 생략, 나머지 유지', () => {
    // 고위도 등에서 -18도에 못 미쳐 완전한 밤이 없는 경우. fullDark 경계가 null이면
    // fullDark 밴드와 그에 맞닿는 morning-astronomical(fullDarkEnd 시작) 밴드가 생략된다.
    const astro = makeAstro({ fullDarkStart: null, fullDarkEnd: null });
    const boxes = buildAnnotations(astro, NIGHT_START, NIGHT_END);
    expect(boxes.find((b) => b.id === 'fullDark')).toBeUndefined();
    expect(boxes.find((b) => b.id === 'morning-astronomical')).toBeUndefined();
    // evening-astronomical(nauticalStart~astroStart)은 astro.start가 살아있으면 성립.
    expect(boxes.find((b) => b.id === 'evening-astronomical')).toBeDefined();
    expect(boxes.find((b) => b.id === 'evening-civil')).toBeDefined();
    expect(boxes.find((b) => b.id === 'evening-nautical')).toBeDefined();
    expect(boxes.find((b) => b.id === 'morning-nautical')).toBeDefined();
    expect(boxes.find((b) => b.id === 'morning-civil')).toBeDefined();
  });
});

describe('buildMoonMarkers (2-1번: 월출/월몰 세로선)', () => {
  it('moonrise·moonset이 모두 있으면 마커 2개를 만든다', () => {
    const markers = buildMoonMarkers(makeAstro());
    expect(markers.map((m) => m.id).sort()).toEqual(['moonrise', 'moonset']);
    const rise = markers.find((m) => m.id === 'moonrise');
    expect(rise?.x).toBe(Date.parse('2026-01-01T20:00:00+09:00'));
    expect(rise?.label).toBe('월출');
  });

  it('moonset이 null이면 그 마커만 생략한다', () => {
    const markers = buildMoonMarkers(makeAstro({ moonset: null }));
    expect(markers.map((m) => m.id)).toEqual(['moonrise']);
  });

  it('둘 다 null이면 빈 배열', () => {
    const markers = buildMoonMarkers(makeAstro({ moonrise: null, moonset: null }));
    expect(markers).toEqual([]);
  });
});

describe('buildSunMarkers (일몰/일출 세로선)', () => {
  it('nightStart·nightEnd로 일몰·일출 마커 2개를 만든다', () => {
    const markers = buildSunMarkers(makeAstro());
    expect(markers.map((m) => m.id)).toEqual(['sunset', 'sunrise']);
    expect(markers.find((m) => m.id === 'sunset')?.x).toBe(
      Date.parse('2026-01-01T17:30:00+09:00'),
    );
    expect(markers.find((m) => m.id === 'sunset')?.label).toBe('일몰');
    expect(markers.find((m) => m.id === 'sunrise')?.label).toBe('일출');
  });
});

describe('labelPlacementFor (사용자 지정 배치: id 접두사로 저녁/새벽 직접 판정)', () => {
  it('저녁 시민박명(evening-civil)은 세로 -90도', () => {
    expect(labelPlacementFor('evening-civil', 'civil')).toEqual({
      kind: 'vertical',
      rotationDeg: -90,
    });
  });

  it('새벽 시민박명(morning-civil)은 세로 90도', () => {
    expect(labelPlacementFor('morning-civil', 'civil')).toEqual({
      kind: 'vertical',
      rotationDeg: 90,
    });
  });

  it('저녁 항해박명은 세로 -90도, 새벽 항해박명은 90도', () => {
    expect(labelPlacementFor('evening-nautical', 'nautical')).toEqual({
      kind: 'vertical',
      rotationDeg: -90,
    });
    expect(labelPlacementFor('morning-nautical', 'nautical')).toEqual({
      kind: 'vertical',
      rotationDeg: 90,
    });
  });

  it('천문박명(저녁·새벽 모두)도 세로 배치다(저녁 -90도·새벽 90도)', () => {
    expect(labelPlacementFor('evening-astronomical', 'astronomical')).toEqual({
      kind: 'vertical',
      rotationDeg: -90,
    });
    expect(labelPlacementFor('morning-astronomical', 'astronomical')).toEqual({
      kind: 'vertical',
      rotationDeg: 90,
    });
  });

  it('fullDark는 가로 배치다', () => {
    expect(labelPlacementFor('fullDark', 'fullDark')).toEqual({ kind: 'horizontal' });
  });
});

describe('buildShadeLabelItems', () => {
  it('7밴드 각각에 대해 배치 정보가 포함된 라벨 항목을 만든다', () => {
    const items = buildShadeLabelItems(makeAstro(), NIGHT_START, NIGHT_END);
    expect(items.length).toBe(7);
    const verticalCount = items.filter((i) => i.placement.kind === 'vertical').length;
    const horizontalCount = items.filter((i) => i.placement.kind === 'horizontal').length;
    expect(verticalCount).toBe(6); // evening/morning civil·nautical·astronomical.
    expect(horizontalCount).toBe(1); // fullDark.
  });
});

describe('buildHourlyTicks (2-5번: x축 고정 1시간 간격)', () => {
  it('KST 정시 기준 1시간 간격 눈금을 만든다', () => {
    const ticks = buildHourlyTicks(NIGHT_START, NIGHT_END);
    expect(ticks.length).toBeGreaterThan(5);
    for (const t of ticks) {
      expect(formatKstHourMinute(t)).toMatch(/^\d{2}:00$/);
    }
    // 인접 틱 간격이 정확히 1시간.
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i] - ticks[i - 1]).toBe(60 * 60 * 1000);
    }
  });

  it('범위가 역전이거나 유효하지 않으면 빈 배열', () => {
    expect(buildHourlyTicks(NIGHT_END, NIGHT_START)).toEqual([]);
    expect(buildHourlyTicks(Number.NaN, NIGHT_END)).toEqual([]);
  });
});

describe('buildChartConfig', () => {
  it('known: 달 곡선 + 구름 데이터셋 2개, 우축 표시', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    expect(config.data.datasets).toHaveLength(2);
    const yCloud = config.options?.scales?.yCloud as { display?: boolean } | undefined;
    expect(yCloud?.display).toBe(true);
  });

  it('unknown: 구름 데이터셋 없음(달 곡선만), 우축 숨김', () => {
    const config = buildChartConfig(makeAstro(), makeCloudUnknown(), NIGHT_START, NIGHT_END);
    expect(config.data.datasets).toHaveLength(1);
    const yCloud = config.options?.scales?.yCloud as { display?: boolean } | undefined;
    expect(yCloud?.display).toBe(false);
  });

  it('outOfHorizon: 구름 데이터셋 없음', () => {
    const config = buildChartConfig(makeAstro(), makeCloudOutOfHorizon(), NIGHT_START, NIGHT_END);
    expect(config.data.datasets).toHaveLength(1);
  });

  it('X축 ticks.callback이 epoch ms를 KST "HH:MM"으로 렌더한다(2번)', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const x = config.options?.scales?.x as
      | { ticks?: { callback?: (v: number) => string } }
      | undefined;
    const cb = x?.ticks?.callback;
    expect(typeof cb).toBe('function');
    const label = (cb as (v: number) => string).call(
      null,
      Date.parse('2026-01-01T19:00:00+09:00'),
    );
    expect(label).toBe('19:00');
  });

  it('달 곡선 데이터셋은 moonHourly 시계열을 쓴다(수평 기준선 아님)', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const moon = config.data.datasets[0].data as Array<{ x: number; y: number }>;
    expect(moon.length).toBeGreaterThan(2);
    expect(Math.max(...moon.map((p) => p.y))).toBe(100);
  });

  it('월출/월몰 세로선 annotation을 포함한다(2-1번)', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const annotations = config.options?.plugins?.annotation?.annotations as
      | Record<string, { type?: string }>
      | undefined;
    expect(annotations?.moonrise?.type).toBe('line');
    expect(annotations?.moonset?.type).toBe('line');
  });

  it('월출/월몰이 null이면 해당 세로선 annotation이 없다', () => {
    const astro = makeAstro({ moonrise: null, moonset: null });
    const config = buildChartConfig(astro, makeCloudKnown(), NIGHT_START, NIGHT_END);
    const annotations = config.options?.plugins?.annotation?.annotations as
      | Record<string, unknown>
      | undefined;
    expect(annotations?.moonrise).toBeUndefined();
    expect(annotations?.moonset).toBeUndefined();
  });

  it('일몰/일출 세로선 annotation을 포함한다', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const annotations = config.options?.plugins?.annotation?.annotations as
      | Record<string, { type?: string }>
      | undefined;
    expect(annotations?.sunset?.type).toBe('line');
    expect(annotations?.sunrise?.type).toBe('line');
  });

  it('구름 채움은 회색 계열 불투명도 0.1다', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const cloudDs = config.data.datasets[1] as { backgroundColor?: string };
    expect(cloudDs.backgroundColor).toBe('rgba(150,158,170,0.1)');
  });

  it('x축에 afterBuildTicks로 고정 1시간 간격 눈금을 적용한다(2-5번)', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const x = config.options?.scales?.x as
      | { afterBuildTicks?: (axis: { ticks: Array<{ value: number }> }) => void }
      | undefined;
    expect(typeof x?.afterBuildTicks).toBe('function');
    const axis = { ticks: [] as Array<{ value: number }> };
    x?.afterBuildTicks?.(axis);
    expect(axis.ticks.length).toBeGreaterThan(5);
    expect(axis.ticks[1].value - axis.ticks[0].value).toBe(60 * 60 * 1000);
  });

  it('박명 box는 음영만 담당하고 label 필드를 두지 않는다(라벨은 커스텀 플러그인이 그림, 2-2-1번)', () => {
    const config = buildChartConfig(makeAstro(), makeCloudKnown(), NIGHT_START, NIGHT_END);
    const annotations = config.options?.plugins?.annotation?.annotations as
      | Record<string, { label?: unknown; type?: string }>
      | undefined;
    expect(annotations?.['evening-civil']?.type).toBe('box');
    expect(annotations?.['evening-civil']?.label).toBeUndefined();
  });
});
