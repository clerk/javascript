import 'regenerator-runtime/runtime';

import { Clerk } from './core/clerk';
import { mountComponentRenderer } from './ui/Components';

export * from './core/resources/Error';

Clerk.mountComponentRenderer = mountComponentRenderer;
export { Clerk };

if (module.hot) {
  module.hot.accept();
}
