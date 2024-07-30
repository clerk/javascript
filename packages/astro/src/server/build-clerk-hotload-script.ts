import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '@clerk/shared/loadClerkJsScript';
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

  const attributes = buildClerkJsScriptAttributes({
    publishableKey,
    proxyUrl,
    domain,
  });
  const attributesString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `
  <script src="${scriptSrc}"
  data-clerk-js-script
  async
  crossOrigin='anonymous'
  ${attributesString}
  ></script>\n`;
}

export { buildClerkHotloadScript };
