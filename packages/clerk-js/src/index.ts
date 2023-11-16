import 'regenerator-runtime/runtime';

import { mountComponentRenderer } from '~ui/Components';

import { Clerk } from './core/clerk';

export * from './core/resources/Error';

Clerk.mountComponentRenderer = mountComponentRenderer;
export { Clerk };

if (module.hot) {
  module.hot.accept();
}
