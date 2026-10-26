/**
 * TTL 메모리 캐시 (BR3.1, 복원력 설계).
 *
 * 동일 날짜·좌표 반복 조회를 캐시 히트로 처리해 무료 한도를 보호한다.
 * 영속 저장이 아니라 세션 범위 메모리(Map) 캐시다. 시각은 주입 가능한
 * nowMs로 받아 테스트 결정성을 확보한다(실시간 Date.now() 의존 없음).
 */

import type { CacheEntry, CloudForecast } from './types.js';

/** known/outOfHorizon 결과의 긴 TTL(기본 60분). */
export const LONG_TTL_MS = 60 * 60 * 1000;

/** unknown 결과의 짧은 TTL(기본 2분). 재진입 시 빠른 재호출을 허용(BR3.2). */
export const SHORT_TTL_MS = 2 * 60 * 1000;

/**
 * dateKstId + lat + lon 으로 캐시 키를 만든다(BR3.1).
 * 좌표는 소수 자릿수 차이로 키가 흩어지지 않도록 일정 정밀도로 고정한다.
 */
export function cacheKey(dateKstId: string, lat: number, lon: number): string {
  return `${dateKstId}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
}

/**
 * CloudForecast 상태에 따른 기본 TTL을 고른다(BR3.1).
 * known/outOfHorizon은 길게, unknown은 짧게.
 */
export function ttlForForecast(forecast: CloudForecast): number {
  return forecast.status === 'unknown' ? SHORT_TTL_MS : LONG_TTL_MS;
}

/**
 * 세션 범위 TTL 메모리 캐시.
 *
 * get/set 모두 현재 시각을 주입 nowMs로 받아 만료 판정을 결정적으로 한다.
 */
export class DataCache {
  private readonly entries = new Map<string, CacheEntry>();

  /**
   * 키에 유효한(TTL 미만) 항목이 있으면 그 CloudForecast를 반환한다.
   * 없거나 만료되었으면 null(캐시 미스). 만료 항목은 제거한다.
   *
   * @param key cacheKey()로 만든 캐시 키.
   * @param nowMs 현재 시각(epoch ms, 주입).
   */
  get(key: string, nowMs: number): CloudForecast | null {
    const entry = this.entries.get(key);
    if (entry === undefined) {
      return null;
    }
    const expiresAtMs = entry.storedAtMs + entry.ttlMs;
    if (nowMs >= expiresAtMs) {
      this.entries.delete(key);
      return null;
    }
    return entry.forecast;
  }

  /**
   * 예보 결과를 TTL과 함께 저장한다(BR3.1).
   *
   * @param key cacheKey()로 만든 캐시 키.
   * @param forecast 보관할 예보 결과.
   * @param ttlMs 유효 기간(ms).
   * @param nowMs 저장 시각(epoch ms, 주입).
   */
  set(key: string, forecast: CloudForecast, ttlMs: number, nowMs: number): void {
    this.entries.set(key, { cacheKey: key, forecast, storedAtMs: nowMs, ttlMs });
  }
}
