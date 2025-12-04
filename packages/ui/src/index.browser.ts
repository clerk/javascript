// TODO: @nikos move this to shared utils
// It's crucial this is the first import,
// otherwise chunk loading will not work
import './utils/setWebpackChunkPublicPath';

// import 'react-dom';
// import 'scheduler';
import { ClerkUi } from './ClerkUi';

if (!window.__internal_ClerkUiCtor) {
  window.__internal_ClerkUiCtor = ClerkUi;
}

// Hot module replacement for development
if (module.hot) {
  module.hot.accept();
}
