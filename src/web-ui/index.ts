/**
 * u4-web-ui 공개 API.
 *
 * AppRoot가 번들 진입점이 마운트하는 루트다. 표시 전용 뷰모델 타입과 순수
 * 매핑 함수(테스트·재사용 표면)를 함께 재노출한다. 소유 엔티티는 없으며
 * 상위 계약(C1·C2·C3)은 각 단위의 공개 index에서만 가져온다.
 */

export { AppRoot, parseRoute, todayKstId } from './app.js';

export type { NightView, ViewState } from './types.js';
export { DEFAULT_LOCATION } from './types.js';

export { assembleNightView } from './assembler.js';
export type { AssemblerDeps, AssembleContext } from './assembler.js';

export { mapState, cloudStatusText, CLOUD_UNKNOWN_TEXT, CLOUD_FAR_DATE_TEXT } from './state.js';
export { toRecommendationView, RECOMMENDED_LABEL } from './recommendationView.js';
export type { RecommendationView } from './recommendationView.js';
export { toNightSummaryView, formatKstTime } from './summaryView.js';
export type { NightSummaryView } from './summaryView.js';
export { averageCloudPct } from './cloudSummary.js';
export {
  buildAnnotations,
  buildChartConfig,
  buildMoonCurve,
  formatKstHourMinute,
  NightChart,
} from './chart.js';
export { renderListView } from './listView.js';
export { renderDetailView } from './detailView.js';
