// It's crucial this is the first import,
// otherwise chunk loading will not work
// eslint-disable-next-line
import './utils/setWebpackChunkPublicPath';
import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';
import { mountComponentRenderer } from './ui/Components';

export * from './core/resources/Error';

Clerk.mountComponentRenderer = mountComponentRenderer;
export default Clerk;

if (module.hot) {
  module.hot.accept();
}
