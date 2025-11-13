import { buildErrorThrower, ClerkRuntimeError } from './error';
import { createDevOrStagingUrlCache, parsePublishableKey } from './keys';
import { loadScript } from './loadScript';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from './proxy';
import type { ClerkOptions, SDKMetadata, Without } from './types';
import { addClerkPrefix } from './url';
import { versionSelector } from './versionSelector';

const ERROR_CODE = 'failed_to_load_clerk_js';
const ERROR_CODE_TIMEOUT = 'failed_to_load_clerk_js_timeout';
const FAILED_TO_LOAD_ERROR = 'Failed to load Clerk';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

const errorThrower = buildErrorThrower({ packageName: '@clerk/shared' });

/**
 * Sets the package name for error messages during ClerkJS script loading.
 *
 * @param packageName - The name of the package to use in error messages (e.g., '@clerk/clerk-react').
 * @example
 * ```typescript
 * setClerkJsLoadingErrorPackageName('@clerk/clerk-react');
 * ```
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
  /**
   * Timeout in milliseconds to wait for clerk-js to load before considering it failed.
   *
   * @default 15000 (15 seconds)
   */
  scriptLoadTimeout?: number;
};

/**
 * Validates that window.Clerk exists and is properly initialized.
 * This ensures we don't have false positives where the script loads but Clerk is malformed.
 *
 * @returns `true` if window.Clerk exists and has the expected structure with a load method.
 */
function isClerkProperlyLoaded(): boolean {
  if (typeof window === 'undefined' || !(window as any).Clerk) {
    return false;
  }

  // Basic validation that window.Clerk has the expected structure
  const clerk = (window as any).Clerk;
  return typeof clerk === 'object' && typeof clerk.load === 'function';
}

/**
 * Waits for Clerk to be properly loaded with a timeout mechanism.
 * Uses polling to check if Clerk becomes available within the specified timeout.
 *
 * @param timeoutMs - Maximum time to wait in milliseconds.
 * @returns Promise that resolves with null if Clerk loads successfully, or rejects with an error if timeout is reached.
 */
function waitForClerkWithTimeout(timeoutMs: number): Promise<HTMLScriptElement | null> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const cleanup = (timeoutId: ReturnType<typeof setTimeout>, pollInterval: ReturnType<typeof setInterval>) => {
      clearTimeout(timeoutId);
      clearInterval(pollInterval);
    };

    const checkAndResolve = () => {
      if (resolved) {
        return;
      }

      if (isClerkProperlyLoaded()) {
        resolved = true;
        cleanup(timeoutId, pollInterval);
        resolve(null);
      }
    };

    const handleTimeout = () => {
      if (resolved) {
        return;
      }

      resolved = true;
      cleanup(timeoutId, pollInterval);

      if (!isClerkProperlyLoaded()) {
        reject(new ClerkRuntimeError(FAILED_TO_LOAD_ERROR, { code: ERROR_CODE_TIMEOUT }));
      } else {
        resolve(null);
      }
    };

    const timeoutId = setTimeout(handleTimeout, timeoutMs);

    checkAndResolve();

    const pollInterval = setInterval(() => {
      if (resolved) {
        clearInterval(pollInterval);
        return;
      }
      checkAndResolve();
    }, 100);
  });
}

/**
 * Hotloads the Clerk JS script with robust failure detection.
 *
 * Uses a timeout-based approach to ensure absolute certainty about load success/failure.
 * If the script fails to load within the timeout period, or loads but doesn't create
 * a proper Clerk instance, the promise rejects with an error.
 *
 * @param opts - The options used to build the Clerk JS script URL and load the script.
 *               Must include a `publishableKey` if no existing script is found.
 * @returns Promise that resolves with null if Clerk loads successfully, or rejects with an error.
 *
 * @example
 * ```typescript
 * try {
 *   await loadClerkJsScript({ publishableKey: 'pk_test_...' });
 *   console.log('Clerk loaded successfully');
 * } catch (error) {
 *   console.error('Failed to load Clerk:', error.message);
 * }
 * ```
 */
const loadClerkJsScript = async (opts?: LoadClerkJsScriptOptions): Promise<HTMLScriptElement | null> => {
  const timeout = opts?.scriptLoadTimeout ?? 15000;

  if (isClerkProperlyLoaded()) {
    return null;
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-clerk-js-script]');

  if (existingScript) {
    return waitForClerkWithTimeout(timeout);
  }

  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return null;
  }

  const loadPromise = waitForClerkWithTimeout(timeout);

  loadScript(clerkJsScriptUrl(opts), {
    async: true,
    crossOrigin: 'anonymous',
    nonce: opts.nonce,
    beforeLoad: applyClerkJsScriptAttributes(opts),
  }).catch(error => {
    throw new ClerkRuntimeError(FAILED_TO_LOAD_ERROR + (error.message ? `, ${error.message}` : ''), {
      code: ERROR_CODE,
      cause: error,
    });
  });

  return loadPromise;
};

/**
 * Generates a Clerk JS script URL based on the provided options.
 *
 * @param opts - The options to use when building the Clerk JS script URL.
 * @returns The complete URL to the Clerk JS script.
 *
 * @example
 * ```typescript
 * const url = clerkJsScriptUrl({ publishableKey: 'pk_test_...' });
 * // Returns: "https://example.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
 * ```
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
 * Builds an object of Clerk JS script attributes based on the provided options.
 *
 * @param options - The options containing the values for script attributes.
 * @returns An object containing data attributes to be applied to the script element.
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

/**
 * Returns a function that applies Clerk JS script attributes to a script element.
 *
 * @param options - The options containing the values for script attributes.
 * @returns A function that accepts a script element and applies the attributes to it.
 */
const applyClerkJsScriptAttributes = (options: LoadClerkJsScriptOptions) => (script: HTMLScriptElement) => {
  const attributes = buildClerkJsScriptAttributes(options);
  for (const attribute in attributes) {
    script.setAttribute(attribute, attributes[attribute]);
  }
};

export { buildClerkJsScriptAttributes, clerkJsScriptUrl, loadClerkJsScript };
export type { LoadClerkJsScriptOptions };
