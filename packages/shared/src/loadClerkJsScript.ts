import type { ClerkOptions, SDKMetadata, Without } from '@clerk/types';

import { buildErrorThrower } from './error';
import { createDevOrStagingUrlCache, parsePublishableKey } from './keys';
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
 * Checks for an existing Clerk JS script and handles various loading states:
 * - If script already loaded successfully: resolves immediately
 * - If script is currently loading: waits for completion
 * - If script failed to load: attempts to load again
 * - If no script exists: loads the script.
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
    if (existingScript.getAttribute('data-clerk-loaded') === 'true') {
      return Promise.resolve(existingScript);
    }

    return new Promise((resolve, reject) => {
      const handleLoad = () => {
        cleanup();
        existingScript.setAttribute('data-clerk-loaded', 'true');
        resolve(existingScript);
      };

      const handleError = () => {
        cleanup();
        existingScript.remove();
        reject(new Error(FAILED_TO_LOAD_ERROR));
      };

      const cleanup = () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      if (existingScript.getAttribute('data-clerk-loaded') === 'true') {
        cleanup();
        resolve(existingScript);
      }
    });
  }

  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return;
  }

  return new Promise<HTMLScriptElement>((resolve, reject) => {
    if (!document || !document.body) {
      reject(new Error('loadClerkJsScript cannot be called when document does not exist'));
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('crossorigin', 'anonymous');
    if (opts.nonce) {
      script.nonce = opts.nonce;
    }

    const handleLoad = () => {
      script.setAttribute('data-clerk-loaded', 'true');
      resolve(script);
    };

    const handleError = () => {
      script.remove();
      reject(new Error(FAILED_TO_LOAD_ERROR));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    applyClerkJsScriptAttributes(opts)(script);

    script.src = clerkJsScriptUrl(opts);
    document.body.appendChild(script);
  }).catch(() => {
    throw new Error(FAILED_TO_LOAD_ERROR);
  });
};

/**
 * Generates a Clerk JS script URL.
 *
 * @param opts - The options to use when building the Clerk JS script URL.
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

  obj['data-clerk-js-script'] = '';

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
