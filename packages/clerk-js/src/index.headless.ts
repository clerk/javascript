import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';

export * from './core/resources/Error';

export default Clerk;

if (module.hot) {
  module.hot.accept();
}
