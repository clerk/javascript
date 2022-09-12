import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';
import { mountComponentRenderer } from './ui';

Clerk.mountComponentRenderer = mountComponentRenderer;

const publishableKey =
  document.querySelector('script[data-clerk-publishable-key]')?.getAttribute('data-clerk-publishable-key') ||
  window.__clerk_publishable_key ||
  '';

const frontendApi =
  document.querySelector('script[data-clerk-frontend-api]')?.getAttribute('data-clerk-frontend-api') ||
  window.__clerk_publishable_key ||
  '';

window.Clerk = new Clerk(publishableKey || frontendApi);

if (module.hot) {
  module.hot.accept();
}
