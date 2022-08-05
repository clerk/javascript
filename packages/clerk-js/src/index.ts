import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';
import { mountComponentRenderer } from './v4';

export { MagicLinkError, MagicLinkErrorCode, isMagicLinkError } from './core/resources';

Clerk.mountComponentRenderer = mountComponentRenderer;
export default Clerk;

if (module.hot) {
  module.hot.accept();
}
