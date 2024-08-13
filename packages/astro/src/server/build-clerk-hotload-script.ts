import { clerkJsScriptUrl } from '@clerk/shared/loadClerkJsScript';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';

function buildClerkHotloadScript(locals: APIContext['locals']) {
  const publishableKey = getSafeEnv(locals).pk!;
  const proxyUrl = getSafeEnv(locals).proxyUrl!;
  const domain = getSafeEnv(locals).domain!;
  const scriptSrc = clerkJsScriptUrl({
    clerkJSUrl: getSafeEnv(locals).clerkJsUrl,
    clerkJSVariant: getSafeEnv(locals).clerkJsVariant,
    clerkJSVersion: getSafeEnv(locals).clerkJsVersion,
    domain,
    proxyUrl,
    publishableKey,
  });
  return `
  <script src="${scriptSrc}"
  data-clerk-js-script
  async
  crossOrigin='anonymous'
  ${publishableKey ? `data-clerk-publishable-key="${publishableKey}"` : ``}
  ${proxyUrl ? `data-clerk-proxy-url="${proxyUrl}"` : ``}
  ${domain ? `data-clerk-domain="${domain}"` : ``}
  ></script>\n`;
}

export { buildClerkHotloadScript };
