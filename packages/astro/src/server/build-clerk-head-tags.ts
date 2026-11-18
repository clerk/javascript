import { clerkJSScriptUrl, clerkUIScriptUrl } from '@clerk/shared/loadClerkJsScript';
import type { APIContext } from 'astro';

import { CLERK_ASTRO_DATA, CLERK_ASTRO_SAFE_VARS, encodeHeadData } from '../utils/head-data';
import { getClientSafeEnv, getSafeEnv } from './get-safe-env';

const UNQUOTED_ATTRIBUTE_VALUE = /^[^\s"'`<>]+$/;

const preload = (href: string) =>
  UNQUOTED_ATTRIBUTE_VALUE.test(href) ? `<link rel=preload as=script href=${href} crossorigin=anonymous>\n` : '';

/**
 * Builds the tags the middleware inserts into every HTML page. The markup has no quotes and no end
 * tags, so if it ever lands inside an attribute value, a comment, or element text, it stays text
 * there instead of closing that context. clerk-js and clerk-ui are only preloaded here. The
 * integration's page script reads the data and adds their script elements.
 */
function buildClerkHeadTags(locals: APIContext['locals']) {
  const env = getSafeEnv(locals);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publishableKey = env.pk!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const proxyUrl = env.proxyUrl!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const domain = env.domain!;

  const data =
    `<meta name=${CLERK_ASTRO_DATA} content=${encodeHeadData(locals.auth())}>\n` +
    `<meta name=${CLERK_ASTRO_SAFE_VARS} content=${encodeHeadData(getClientSafeEnv(locals))}>\n`;

  const clerkJs = preload(
    clerkJSScriptUrl({
      __internal_clerkJSUrl: env.clerkJsUrl,
      __internal_clerkJSVersion: env.clerkJsVersion,
      domain,
      proxyUrl,
      publishableKey,
    }),
  );

  if (env.prefetchUI === false) {
    return data + clerkJs;
  }

  const clerkUI = preload(
    clerkUIScriptUrl({
      __internal_clerkUIUrl: env.clerkUIUrl,
      __internal_clerkUIVersion: env.clerkUIVersion,
      domain,
      proxyUrl,
      publishableKey,
    }),
  );

  return data + clerkJs + clerkUI;
}

export { buildClerkHeadTags };
