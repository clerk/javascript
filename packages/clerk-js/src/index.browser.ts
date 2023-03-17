// It's crucial this is the first import,
// otherwise chunk loading will not work
// eslint-disable-next-line
import './utils/setWebpackChunkPublicPath';

import 'regenerator-runtime/runtime';

import Clerk from './core/clerk';
import { mountComponentRenderer } from './ui/Components';

Clerk.mountComponentRenderer = mountComponentRenderer;

const publishableKey =
  document.querySelector('script[data-clerk-publishable-key]')?.getAttribute('data-clerk-publishable-key') ||
  window.__clerk_publishable_key ||
  '';

const frontendApi =
  document.querySelector('script[data-clerk-frontend-api]')?.getAttribute('data-clerk-frontend-api') ||
  window.__clerk_frontend_api ||
  '';

const proxyUrl =
  document.querySelector('script[data-clerk-proxy-url]')?.getAttribute('data-clerk-proxy-url') ||
  window.__clerk_proxy_url ||
  '';

const domain =
  document.querySelector('script[data-clerk-domain]')?.getAttribute('data-clerk-domain') || window.__clerk_domain || '';

window.Clerk = new Clerk(publishableKey || frontendApi, {
  proxyUrl,
  // @ts-expect-error
  domain,
});

if (module.hot) {
  module.hot.accept();
}
