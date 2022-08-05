import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';
import Components from './ui';

export { MagicLinkError, MagicLinkErrorCode, isMagicLinkError } from './core/resources';

Clerk.Components = Components;
export default Clerk;

if (module.hot) {
  module.hot.accept();
}
