import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';

const frontendApi =
  document.querySelector('script[data-clerk-frontend-api]')?.getAttribute('data-clerk-frontend-api') || '';

window.Clerk = new Clerk(frontendApi);

if (module.hot) {
  module.hot.accept();
}
