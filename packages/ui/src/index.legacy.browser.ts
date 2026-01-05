// It's crucial this is the first import,
// otherwise chunk loading will not work
// eslint-disable-next-line
import './utils/setWebpackChunkPublicPath';

import { ClerkUi } from './ClerkUi';

if (!window.__internal_ClerkUiCtor) {
  window.__internal_ClerkUiCtor = ClerkUi;
}

// Hot module replacement for development
if (module.hot) {
  module.hot.accept();
}
