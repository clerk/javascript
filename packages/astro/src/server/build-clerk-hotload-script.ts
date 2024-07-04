import { createDevOrStagingUrlCache, parsePublishableKey } from '@clerk/shared/keys';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from '@clerk/shared/proxy';
import { addClerkPrefix } from '@clerk/shared/url';
import type { APIContext } from 'astro';

import { versionSelector } from '../internal/utils/versionSelector';
import { getSafeEnv } from './get-safe-env';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

type BuildClerkJsScriptOptions = {
  proxyUrl: string;
  domain: string;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
  publishableKey: string;
};

const clerkJsScriptUrl = (opts: BuildClerkJsScriptOptions) => {
  const { clerkJSUrl, clerkJSVariant, clerkJSVersion, proxyUrl, domain, publishableKey } = opts;

  if (clerkJSUrl) {
    return clerkJSUrl;
  }

  let scriptHost = '';
  if (!!proxyUrl && isValidProxyUrl(proxyUrl)) {
    scriptHost = proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, '');
  } else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || '')) {
    scriptHost = addClerkPrefix(domain);
  } else {
    scriptHost = parsePublishableKey(publishableKey)?.frontendApi || '';
  }

  const variant = clerkJSVariant ? `${clerkJSVariant.replace(/\.+$/, '')}.` : '';
  const version = versionSelector(clerkJSVersion);
  return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.${variant}browser.js`;
};

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
  data-clerk-script 
  async 
  crossOrigin='anonymous' 
  ${publishableKey ? `data-clerk-publishable-key="${publishableKey}"` : ``}
  ${proxyUrl ? `data-clerk-proxy-url="${proxyUrl}"` : ``}
  ${domain ? `data-clerk-domain="${domain}"` : ``}
  ></script>\n`;
}

export { buildClerkHotloadScript };
