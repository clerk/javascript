import type { ClerkOptions, SDKMetadata, Without } from '@clerk/types';

import { createDevOrStagingUrlCache, parsePublishableKey } from './keys';
import { loadScript } from './loadScript';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from './proxy';
import { addClerkPrefix } from './url';

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';
const MISSING_PUBLISHABLE_KEY_ERROR =
  'Clerk: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

type LoadClerkJsScriptOptions = Without<ClerkOptions, 'isSatellite'> & {
  publishableKey: string;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
  sdkMetadata?: SDKMetadata;
  proxyUrl?: string;
  domain?: string;
};

const loadClerkJsScript = async (opts: LoadClerkJsScriptOptions) => {
  const { publishableKey } = opts;

  if (!publishableKey) {
    throw new Error(MISSING_PUBLISHABLE_KEY_ERROR);
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-clerk-js-script]');

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => {
        resolve(existingScript);
      });

      existingScript.addEventListener('error', () => {
        reject(FAILED_TO_LOAD_ERROR);
      });
    });
  }

  return loadScript(clerkJsScriptUrl(opts), {
    async: true,
    crossOrigin: 'anonymous',
    beforeLoad: applyClerkJsScriptAttributes(opts),
  }).catch(() => {
    throw new Error(FAILED_TO_LOAD_ERROR);
  });
};

const clerkJsScriptUrl = (opts: LoadClerkJsScriptOptions) => {
  const { clerkJSUrl, clerkJSVariant, clerkJSVersion = '5', proxyUrl, domain, publishableKey } = opts;

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
  return `https://${scriptHost}/npm/@clerk/clerk-js@${clerkJSVersion}/dist/clerk.${variant}browser.js`;
};

const buildClerkJsScriptAttributes = (options: LoadClerkJsScriptOptions) => {
  const obj: Record<string, string> = {};

  if (options.publishableKey) {
    obj['data-clerk-publishable-key'] = options.publishableKey;
  }

  if (options.proxyUrl) {
    obj['data-clerk-proxy-url'] = options.proxyUrl;
  }

  if (options.domain) {
    obj['data-clerk-domain'] = options.domain;
  }

  return obj;
};

const applyClerkJsScriptAttributes = (options: LoadClerkJsScriptOptions) => (script: HTMLScriptElement) => {
  const attributes = buildClerkJsScriptAttributes(options);
  for (const attribute in attributes) {
    script.setAttribute(attribute, attributes[attribute]);
  }
};

export { loadClerkJsScript, buildClerkJsScriptAttributes, clerkJsScriptUrl };
export type { LoadClerkJsScriptOptions };
