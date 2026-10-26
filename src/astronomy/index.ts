/**
 * u1-astronomy 공개 API.
 *
 * computeAstronomy가 유일한 public 진입점이다(logical-components).
 * 내부 계산 함수와 astronomy-engine 접근은 캡슐화되어 노출하지 않는다.
 */

export { computeAstronomy } from './astronomy.js';
export {
  AstronomyComputationError,
  type AstronomyInput,
  type AstronomyResult,
  type TwilightWindow,
} from './types.js';
