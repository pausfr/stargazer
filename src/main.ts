/**
 * 브라우저 진입점 (u4-web-ui, 번들 진입점).
 *
 * AppRoot를 `#app` 요소에 마운트한다. 비밀값·API 키를 포함하지 않는다
 * (NFR6.1). 실제 데이터 조립·라우팅은 AppRoot가 소유한다(functional-spec §5.1).
 */

import './web-ui/styles.css';
import { AppRoot } from './web-ui/index.js';

const mount = document.getElementById('app');
if (mount === null) {
  throw new Error('#app mount point not found');
}

const app = new AppRoot(mount);
app.start();
