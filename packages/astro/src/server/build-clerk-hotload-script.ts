import { clerkJsScriptUrl } from '@clerk/shared/loadClerkJsScript';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';

function buildClerkHotloadScript(locals: APIContext['locals']) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publishableKey = getSafeEnv(locals).pk!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const proxyUrl = getSafeEnv(locals).proxyUrl!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
