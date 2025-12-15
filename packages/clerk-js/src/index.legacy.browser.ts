// It's crucial this is the first import,
// otherwise chunk loading will not work

import './utils/setWebpackChunkPublicPath';

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

// Ensure that if the script has already been injected we don't overwrite the existing Clerk instance.
if (!window.Clerk) {
  window.Clerk = new Clerk(publishableKey, {
    proxyUrl,
    domain,
  });
}

if (module.hot) {
  module.hot.accept();
}
