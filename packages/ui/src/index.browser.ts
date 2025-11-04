// TODO: @nikos move this to shared utils
// It's crucial this is the first import,
// otherwise chunk loading will not work
import './utils/setWebpackChunkPublicPath';

/**
 * Browser bundle entry point for @clerk/ui
 *
 * This file is built with rspack and exposes the UI components
 * to the global window object for consumption by clerk-js and other packages.
 */
import { mountComponentRenderer } from './Components';

if (!window.__unstable_ClerkUi) {
  window.__unstable_ClerkUi = {
    mountComponentRenderer,
    version: PACKAGE_VERSION,
  };
}

// // Hot module replacement for development
// if (module.hot) {
//   module.hot.accept();
// }
