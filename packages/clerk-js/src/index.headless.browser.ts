// It's crucial this is the first import,
// otherwise chunk loading will not work
// eslint-disable-next-line
import './utils/setWebpackChunkPublicPath';

import 'regenerator-runtime/runtime';

import { Clerk } from './core/clerk';

const publishableKey =
  document.querySelector('script[data-clerk-publishable-key]')?.getAttribute('data-clerk-publishable-key') ||
  window.__clerk_publishable_key ||
  '';

const proxyUrl =
  document.querySelector('script[data-clerk-proxy-url]')?.getAttribute('data-clerk-proxy-url') ||
  window.__clerk_proxy_url ||
  '';

const domain =
  document.querySelector('script[data-clerk-domain]')?.getAttribute('data-clerk-domain') || window.__clerk_domain || '';

if (!window.Clerk) {
  window.Clerk = new Clerk(publishableKey, {
    proxyUrl,
    domain,
  });
}

if (module.hot) {
  module.hot.accept();
}
