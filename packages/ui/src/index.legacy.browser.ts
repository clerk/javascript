// It's crucial this is the first import,
// otherwise chunk loading will not work
// eslint-disable-next-line
import './utils/setWebpackChunkPublicPath';

import { ClerkUI } from './ClerkUI';

if (!window.__internal_ClerkUICtor) {
  window.__internal_ClerkUICtor = ClerkUI;
}

// Hot module replacement for development
if (module.hot) {
  module.hot.accept();
}
