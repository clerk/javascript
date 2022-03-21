import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';

export { MagicLinkError, MagicLinkErrorCode, isMagicLinkError } from './core/resources';

export default Clerk;

if (module.hot) {
  module.hot.accept();
}
