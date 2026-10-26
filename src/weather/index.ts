/**
 * u2-weather-data 공개 API.
 *
 * getCloudForecast가 유일한 공개 진입점이다(C2, WF1). 외부 날씨 API의
 * 원형 응답/타입은 어댑터 경계 안에 캡슐화되어 노출하지 않는다(BR2.2).
 */

export { getCloudForecast } from './weather.js';
export type { GetCloudForecastOptions, GetCloudForecastDeps } from './weather.js';
export { DataCache } from './cache.js';
export {
  FORECAST_HORIZON_DAYS,
  type CloudForecast,
  type CloudStatus,
  type CloudForecastQuery,
  type HourlyCloud,
} from './types.js';
