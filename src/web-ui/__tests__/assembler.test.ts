/**
 * Step 8 — 조립 테스트 (functional-spec §2.1·§5, PD1·PD3).
 *
 * mock U1/U2/U3로 NightView 조립을 결정적으로 검증한다: 천문 우선 산출,
 * known/unknown/outOfHorizon/astro-throw 각 경로의 state·verdict, 밤 범위를
 * computeAstronomy에 전달하는지, 같은 cache·nowMs를 재사용하는지. 외부 날씨
 * API는 호출하지 않는다.
 */

import { describe, it, expect, vi } from 'vitest';
import { DataCache } from '../../weather/index.js';
import { AstronomyComputationError } from '../../astronomy/index.js';
import { assembleNightView, type AssemblerDeps } from '../assembler.js';
import {
  makeAstro,
  makeCalendar,
  makeCloudKnown,
  makeCloudOutOfHorizon,
  makeCloudUnknown,
  makeRecommendation,
} from './fixtures.js';

function makeDeps(partial: Partial<AssemblerDeps> = {}): AssemblerDeps {
  return {
    computeAstronomy: vi.fn(() => makeAstro()),
    getCloudForecast: vi.fn(async () => makeCloudKnown()),
    recommend: vi.fn(() => makeRecommendation()),
    ...partial,
  };
}

const ctx = () => ({ cache: new DataCache(), nowMs: 1_767_225_600_000 });

describe('assembleNightView', () => {
  it('known 경로: state=ok, verdict 전달, 추천 판정 산출', async () => {
    const deps = makeDeps();
    const view = await assembleNightView(makeCalendar(), ctx(), deps);
    expect(view.state).toBe('ok');
    expect(view.astro).not.toBeNull();
    expect(view.astroError).toBe(false);
    expect(view.verdict?.verdict).toBe('recommended');
    expect(view.cloud.status).toBe('known');
  });

  it('unknown 경로: state=partial', async () => {
    const deps = makeDeps({ getCloudForecast: vi.fn(async () => makeCloudUnknown()) });
    const view = await assembleNightView(makeCalendar(), ctx(), deps);
    expect(view.state).toBe('partial');
    expect(view.verdict).not.toBeNull();
  });

  it('outOfHorizon 경로: state=ok', async () => {
    const deps = makeDeps({ getCloudForecast: vi.fn(async () => makeCloudOutOfHorizon()) });
    const view = await assembleNightView(makeCalendar(), ctx(), deps);
    expect(view.state).toBe('ok');
  });

  it('astro throw 경로: state=error, astro=null, verdict=null, recommend 미호출', async () => {
    const recommend = vi.fn(() => makeRecommendation());
    const deps = makeDeps({
      computeAstronomy: vi.fn(() => {
        throw new AstronomyComputationError('invalid');
      }),
      recommend,
    });
    const view = await assembleNightView(makeCalendar(), ctx(), deps);
    expect(view.state).toBe('error');
    expect(view.astro).toBeNull();
    expect(view.astroError).toBe(true);
    expect(view.verdict).toBeNull();
    expect(recommend).not.toHaveBeenCalled();
  });

  it('천문 우선: computeAstronomy에 밤 범위(nightStartKst/nightEndKst)와 좌표를 전달한다', async () => {
    const computeAstronomy = vi.fn<AssemblerDeps['computeAstronomy']>(() => makeAstro());
    const deps = makeDeps({ computeAstronomy });
    const calendar = makeCalendar({
      nightStartKst: '2026-01-01T18:00:00+09:00',
      nightEndKst: '2026-01-02T06:00:00+09:00',
    });
    await assembleNightView(calendar, ctx(), deps);
    const arg = computeAstronomy.mock.calls[0]![0];
    expect(arg.nightStartKst).toBe('2026-01-01T18:00:00+09:00');
    expect(arg.nightEndKst).toBe('2026-01-02T06:00:00+09:00');
    expect(arg.lat).toBeCloseTo(37.5665, 4);
    expect(arg.lon).toBeCloseTo(126.978, 4);
    expect(arg.dateKstId).toBe('2026-01-01');
  });

  it('같은 cache·nowMs 인스턴스를 getCloudForecast에 주입·재사용한다(PD3)', async () => {
    const getCloudForecast = vi.fn<AssemblerDeps['getCloudForecast']>(async () => makeCloudKnown());
    const deps = makeDeps({ getCloudForecast });
    const sharedCtx = ctx();
    await assembleNightView(makeCalendar({ dateKstId: '2026-01-01' }), sharedCtx, deps);
    await assembleNightView(makeCalendar({ dateKstId: '2026-01-02' }), sharedCtx, deps);
    const [, opt1] = getCloudForecast.mock.calls[0]!;
    const [, opt2] = getCloudForecast.mock.calls[1]!;
    expect(opt1.cache).toBe(sharedCtx.cache);
    expect(opt2.cache).toBe(sharedCtx.cache);
    expect(opt1.nowMs).toBe(sharedCtx.nowMs);
    expect(opt2.nowMs).toBe(sharedCtx.nowMs);
  });
});
