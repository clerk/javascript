import { clerkJsScriptUrl, clerkUiScriptUrl } from '@clerk/shared/loadClerkJsScript';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';

function buildClerkHotloadScript(locals: APIContext['locals']) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publishableKey = getSafeEnv(locals).pk!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const proxyUrl = getSafeEnv(locals).proxyUrl!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const domain = getSafeEnv(locals).domain!;
  const clerkJsVariant = getSafeEnv(locals).clerkJsVariant;
  const clerkJsScriptSrc = clerkJsScriptUrl({
    clerkJSUrl: getSafeEnv(locals).clerkJsUrl,
    clerkJSVariant: clerkJsVariant,
    clerkJSVersion: getSafeEnv(locals).clerkJsVersion,
    domain,
    proxyUrl,
    publishableKey,
  });

  const clerkJsScript = `
  <script src="${clerkJsScriptSrc}"
  data-clerk-js-script
  async
  crossOrigin='anonymous'
  ${publishableKey ? `data-clerk-publishable-key="${publishableKey}"` : ``}
  ${proxyUrl ? `data-clerk-proxy-url="${proxyUrl}"` : ``}
  ${domain ? `data-clerk-domain="${domain}"` : ``}
  ></script>`;

  // Skip clerk-ui script for headless variant
  if (clerkJsVariant === 'headless') {
    return clerkJsScript + '\n';
  }

  const clerkUiScriptSrc = clerkUiScriptUrl({
    clerkUiUrl: getSafeEnv(locals).clerkUiUrl,
    domain,
    proxyUrl,
    publishableKey,
  });

  const clerkUiScript = `
  <script src="${clerkUiScriptSrc}"
  data-clerk-ui-script
  async
  crossOrigin='anonymous'
  ${publishableKey ? `data-clerk-publishable-key="${publishableKey}"` : ``}
  ${proxyUrl ? `data-clerk-proxy-url="${proxyUrl}"` : ``}
  ${domain ? `data-clerk-domain="${domain}"` : ``}
  ></script>`;

  return clerkJsScript + clerkUiScript + '\n';
}

export { buildClerkHotloadScript };
