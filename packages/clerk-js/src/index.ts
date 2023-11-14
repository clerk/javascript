import 'regenerator-runtime/runtime';

// eslint-disable-next-line import/no-unresolved -- this is a webpack alias
import { mountComponentRenderer } from '~ui/Components';

import Clerk from './core/clerk';

export * from './core/resources/Error';

Clerk.mountComponentRenderer = mountComponentRenderer;
export default Clerk;

if (module.hot) {
  module.hot.accept();
}
