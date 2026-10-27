/**
 * Step 14(일부) — 구름 요약 순수 매핑 테스트.
 *
 * known 평균 요약과 비-known(null) 처리를 검증한다.
 */

import { describe, it, expect } from 'vitest';
import { averageCloudPct } from '../cloudSummary.js';
import { makeCloudKnown, makeCloudOutOfHorizon, makeCloudUnknown } from './fixtures.js';

describe('averageCloudPct', () => {
  it('known: 시간별 평균(반올림)', () => {
    // fixtures: 10, 20, 15 → 평균 15.
    expect(averageCloudPct(makeCloudKnown())).toBe(15);
  });

  it('outOfHorizon → null(요약 대상 아님)', () => {
    expect(averageCloudPct(makeCloudOutOfHorizon())).toBeNull();
  });

  it('unknown → null(내부 reason 읽지 않음)', () => {
    expect(averageCloudPct(makeCloudUnknown())).toBeNull();
  });

  it('known이지만 빈 배열 → null', () => {
    expect(averageCloudPct(makeCloudKnown({ hourlyCloudPct: [] }))).toBeNull();
  });
});
