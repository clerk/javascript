import { clerkJSScriptUrl, clerkUIScriptUrl, shouldPrefetchClerkUI } from '@clerk/shared/loadClerkJsScript';
import type { APIContext } from 'astro';

import { getSafeEnv } from './get-safe-env';

function buildClerkHotloadScript(locals: APIContext['locals']) {
  const env = getSafeEnv(locals);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publishableKey = env.pk!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const proxyUrl = env.proxyUrl!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const domain = env.domain!;

  const clerkJsScriptSrc = clerkJSScriptUrl({
    clerkJSUrl: env.clerkJsUrl,
    clerkJSVersion: env.clerkJsVersion,
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

  if (!shouldPrefetchClerkUI(env.prefetchUI)) {
    return clerkJsScript + '\n';
  }

  const clerkUiScriptSrc = clerkUIScriptUrl({
    clerkUIUrl: env.clerkUIUrl,
    domain,
    proxyUrl,
    publishableKey,
  });

  // Use <link rel='preload'> instead of <script> for the UI bundle.
  // This tells the browser to download the resource immediately (high priority)
  // but doesn't execute it, avoiding race conditions with __clerkSharedModules
  // registration (which happens when React code runs @clerk/ui/register).
  // When loadClerkUIScript() later adds a <script> tag, the browser uses the
  // cached resource and executes it without re-downloading.
  const clerkUiPreload = `
  <link rel="preload"
  href="${clerkUiScriptSrc}"
  as="script"
  crossOrigin="anonymous"
  />`;

  return clerkJsScript + clerkUiPreload + '\n';
}

export { buildClerkHotloadScript };
