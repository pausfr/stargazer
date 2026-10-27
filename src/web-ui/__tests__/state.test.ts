/**
 * Step 6 — 상태 매핑 테스트 (functional-spec §5, FR6.1~6.3, SD3).
 *
 * 4상태 전이 전부와 내부 사유 비노출(중립 문구만)을 검증한다.
 */

import { describe, it, expect } from 'vitest';
import { mapState, cloudStatusText, CLOUD_UNKNOWN_TEXT, CLOUD_FAR_DATE_TEXT } from '../state.js';
import { makeAstro, makeCloudKnown, makeCloudOutOfHorizon, makeCloudUnknown } from './fixtures.js';

describe('mapState (상태 전이)', () => {
  it('천문 실패(astro=null)면 error', () => {
    expect(mapState(null, makeCloudKnown())).toBe('error');
    // 천문 실패는 구름 상태와 무관하게 error가 우선.
    expect(mapState(null, makeCloudUnknown())).toBe('error');
    expect(mapState(null, makeCloudOutOfHorizon())).toBe('error');
  });

  it('천문 OK + 날씨 known → ok', () => {
    expect(mapState(makeAstro(), makeCloudKnown())).toBe('ok');
  });

  it('천문 OK + 날씨 outOfHorizon → ok', () => {
    expect(mapState(makeAstro(), makeCloudOutOfHorizon())).toBe('ok');
  });

  it('천문 OK + 날씨 unknown → partial', () => {
    expect(mapState(makeAstro(), makeCloudUnknown())).toBe('partial');
  });
});

describe('cloudStatusText (내부 사유 비노출)', () => {
  it('known은 상태 문구 없음(요약은 호출부가 생성)', () => {
    expect(cloudStatusText(makeCloudKnown())).toBeNull();
  });

  it('outOfHorizon은 "가까워지면" 중립 안내', () => {
    expect(cloudStatusText(makeCloudOutOfHorizon())).toBe(CLOUD_FAR_DATE_TEXT);
  });

  it('unknown은 중립 "구름량 알 수 없음"이며 내부 reason을 노출하지 않는다', () => {
    const cloud = makeCloudUnknown('2026-01-01', 'HTTP 500 upstream timeout');
    const text = cloudStatusText(cloud);
    expect(text).toBe(CLOUD_UNKNOWN_TEXT);
    // 내부 사유 문자열이 표시 문구에 새지 않는다(SD3/FR6.3).
    expect(text).not.toContain('HTTP');
    expect(text).not.toContain('timeout');
  });
});
