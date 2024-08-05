import type { ClerkOptions, SDKMetadata, Without } from '@clerk/types';

import { createDevOrStagingUrlCache, parsePublishableKey } from './keys';
import { loadScript } from './loadScript';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from './proxy';
import { addClerkPrefix } from './url';
import { versionSelector } from './versionSelector';

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
  /**
   * @internal
   * The version of `@clerk/clerk-js` that will be used if an explicit version
   * is not provided. For `@clerk/clerk-react`, this will be the PACKAGE_VERSION.
   */
  __internal_packageVersion?: string;
};

/**
 * Hotloads the Clerk JS script.
 *
 * Checks for an existing Clerk JS script. If found, it returns a promise
 * that resolves when the script loads. If not found, it uses the provided options to
 * build the Clerk JS script URL and load the script.
 *
 * @param opts - The options used to build the Clerk JS script URL and load the script.
 *               Must include a `publishableKey` if no existing script is found.
 *
 * @example
 * loadClerkJsScript({ publishableKey: 'pk_' });
 */
const loadClerkJsScript = async (opts?: LoadClerkJsScriptOptions) => {
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

  if (!opts?.publishableKey) {
    throw new Error(MISSING_PUBLISHABLE_KEY_ERROR);
  }

  return loadScript(clerkJsScriptUrl(opts), {
    async: true,
    crossOrigin: 'anonymous',
    beforeLoad: applyClerkJsScriptAttributes(opts),
  }).catch(() => {
    throw new Error(FAILED_TO_LOAD_ERROR);
  });
};

/**
 * Generates a Clerk JS script URL.
 *
 * @param opts - The options to use when building the Clerk JS script URL.
 *
 * @example
 * clerkJsScriptUrl({ publishableKey: 'pk_' });
 */
const clerkJsScriptUrl = (opts: LoadClerkJsScriptOptions) => {
  const { clerkJSUrl, clerkJSVariant, clerkJSVersion, proxyUrl, domain, publishableKey, __internal_packageVersion } =
    opts;

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
  const version = versionSelector(clerkJSVersion, __internal_packageVersion);
  return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.${variant}browser.js`;
};

/**
 * Builds an object of Clerk JS script attributes.
 */
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
