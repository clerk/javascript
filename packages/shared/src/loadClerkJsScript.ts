import type { ClerkOptions, SDKMetadata, Without } from '@clerk/types';

import { buildErrorThrower } from './error';
import { createDevOrStagingUrlCache, parsePublishableKey } from './keys';
import { loadScript } from './loadScript';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from './proxy';
import { addClerkPrefix } from './url';
import { versionSelector } from './versionSelector';

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

const errorThrower = buildErrorThrower({ packageName: '@clerk/shared' });

/**
 * Sets the package name for error messages during ClerkJS script loading.
 *
 * @example
 * setClerkJsLoadingErrorPackageName('@clerk/clerk-react');
 */
export function setClerkJsLoadingErrorPackageName(packageName: string) {
  errorThrower.setPackageName({ packageName });
}

type LoadClerkJsScriptOptions = Without<ClerkOptions, 'isSatellite'> & {
  publishableKey: string;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
  sdkMetadata?: SDKMetadata;
  proxyUrl?: string;
  domain?: string;
  nonce?: string;
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
    const attemptExisting = new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => {
        resolve(existingScript);
      });

      existingScript.addEventListener('error', () => {
        reject(FAILED_TO_LOAD_ERROR);
      });

      setTimeout(() => {
        reject();
      }, 2_000);
    });

    const loaded = await attemptExisting
      .then(() => true)
      .catch(msg => {
        if (msg === FAILED_TO_LOAD_ERROR) {
          throw msg;
        }
        return false;
      });

    if (loaded) {
      return;
    }
  }

  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return;
  }

  return loadScript(clerkJsScriptUrl(opts), {
    async: true,
    crossOrigin: 'anonymous',
    nonce: opts.nonce,
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

  if (options.nonce) {
    obj.nonce = options.nonce;
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
