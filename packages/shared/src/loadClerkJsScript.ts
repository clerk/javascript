import { buildErrorThrower, ClerkRuntimeError } from './error';
import { createDevOrStagingUrlCache, parsePublishableKey } from './keys';
import { loadScript } from './loadScript';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from './proxy';
import type { SDKMetadata } from './types';
import { addClerkPrefix } from './url';
import { versionSelector } from './versionSelector';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

const errorThrower = buildErrorThrower({ packageName: '@clerk/shared' });

export type LoadClerkJSScriptOptions = {
  publishableKey: string;
  clerkJSUrl?: string;
  /** @deprecated This option is deprecated. The Clerk SDK will automatically use the correct version. */
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
 * @deprecated Use `LoadClerkJSScriptOptions` instead. This alias will be removed in a future major version.
 */
export type LoadClerkJsScriptOptions = LoadClerkJSScriptOptions;

export type LoadClerkUIScriptOptions = {
  publishableKey: string;
  clerkUIUrl?: string;
  proxyUrl?: string;
  domain?: string;
  nonce?: string;
  scriptLoadTimeout?: number;
};

/**
 * Validates that window.Clerk exists and is properly initialized.
 * This ensures we don't have false positives where the script loads but Clerk is malformed.
 *
 * @returns `true` if window.Clerk exists and has the expected structure with a load method.
 */
function isClerkGlobalProperlyLoaded(prop: 'Clerk' | '__internal_ClerkUICtor'): boolean {
  if (typeof window === 'undefined' || !(window as any)[prop]) {
    return false;
  }

  // Basic validation that window.Clerk has the expected structure
  const val = (window as any)[prop];
  return !!val;
}
const isClerkProperlyLoaded = () => isClerkGlobalProperlyLoaded('Clerk');
const isClerkUIProperlyLoaded = () => isClerkGlobalProperlyLoaded('__internal_ClerkUICtor');

/**
 * Checks if an existing script has a request error using Performance API.
 *
 * @param scriptUrl - The URL of the script to check.
 * @returns True if the script has failed to load due to a network/HTTP error.
 */
function hasScriptRequestError(scriptUrl: string): boolean {
  if (typeof window === 'undefined' || !window.performance) {
    return false;
  }

  const entries = performance.getEntriesByName(scriptUrl, 'resource') as PerformanceResourceTiming[];

  if (entries.length === 0) {
    return false;
  }

  const scriptEntry = entries[entries.length - 1];

  // transferSize === 0 with responseEnd === 0 indicates network failure
  // transferSize === 0 with responseEnd > 0 might be a 4xx/5xx error or blocked request
  if (scriptEntry.transferSize === 0 && scriptEntry.decodedBodySize === 0) {
    // If there was no response at all, it's definitely an error
    if (scriptEntry.responseEnd === 0) {
      return true;
    }
    // If we got a response but no content, likely an HTTP error (4xx/5xx)
    if (scriptEntry.responseEnd > 0 && scriptEntry.responseStart > 0) {
      return true;
    }

    if ('responseStatus' in scriptEntry) {
      const status = (scriptEntry as any).responseStatus;
      if (status >= 400) {
        return true;
      }
      if (scriptEntry.responseStatus === 0) {
        return true;
      }
    }
  }

  return false;
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
export const loadClerkJSScript = async (opts?: LoadClerkJSScriptOptions): Promise<HTMLScriptElement | null> => {
  const timeout = opts?.scriptLoadTimeout ?? 15000;
  const rejectWith = (error?: Error) =>
    new ClerkRuntimeError('Failed to load Clerk JS' + (error?.message ? `, ${error.message}` : ''), {
      code: 'failed_to_load_clerk_js',
      cause: error,
    });

  if (isClerkProperlyLoaded()) {
    return null;
  }

  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return null;
  }

  const scriptUrl = clerkJSScriptUrl(opts);
  const existingScript = document.querySelector<HTMLScriptElement>('script[data-clerk-js-script]');

  if (existingScript) {
    if (hasScriptRequestError(scriptUrl)) {
      existingScript.remove();
    } else {
      try {
        await waitForPredicateWithTimeout(timeout, isClerkProperlyLoaded, rejectWith(), existingScript);
        return null;
      } catch {
        existingScript.remove();
      }
    }
  }

  const loadPromise = waitForPredicateWithTimeout(timeout, isClerkProperlyLoaded, rejectWith());

  loadScript(scriptUrl, {
    async: true,
    crossOrigin: 'anonymous',
    nonce: opts.nonce,
    beforeLoad: applyAttributesToScript(buildClerkJSScriptAttributes(opts)),
  }).catch(error => {
    throw rejectWith(error);
  });

  return loadPromise;
};

export const loadClerkUIScript = async (opts?: LoadClerkUIScriptOptions): Promise<HTMLScriptElement | null> => {
  const timeout = opts?.scriptLoadTimeout ?? 15000;
  const rejectWith = (error?: Error) =>
    new ClerkRuntimeError('Failed to load Clerk UI' + (error?.message ? `, ${error.message}` : ''), {
      code: 'failed_to_load_clerk_ui',
      cause: error,
    });

  if (isClerkUIProperlyLoaded()) {
    return null;
  }

  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return null;
  }

  const scriptUrl = clerkUIScriptUrl(opts);
  const existingScript = document.querySelector<HTMLScriptElement>('script[data-clerk-ui-script]');

  if (existingScript) {
    if (hasScriptRequestError(scriptUrl)) {
      existingScript.remove();
    } else {
      try {
        await waitForPredicateWithTimeout(timeout, isClerkUIProperlyLoaded, rejectWith(), existingScript);
        return null;
      } catch {
        existingScript.remove();
      }
    }
  }

  const loadPromise = waitForPredicateWithTimeout(timeout, isClerkUIProperlyLoaded, rejectWith());

  loadScript(scriptUrl, {
    async: true,
    crossOrigin: 'anonymous',
    nonce: opts.nonce,
    beforeLoad: applyAttributesToScript(buildClerkUIScriptAttributes(opts)),
  }).catch(error => {
    throw rejectWith(error);
  });

  return loadPromise;
};

export const clerkJSScriptUrl = (opts: LoadClerkJSScriptOptions) => {
  const { clerkJSUrl, clerkJSVersion, proxyUrl, domain, publishableKey } = opts;

  if (clerkJSUrl) {
    return clerkJSUrl;
  }

  const scriptHost = buildScriptHost({ publishableKey, proxyUrl, domain });
  const version = versionSelector(clerkJSVersion);
  return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.browser.js`;
};

export const clerkUIScriptUrl = (opts: LoadClerkUIScriptOptions) => {
  const { clerkUIUrl, proxyUrl, domain, publishableKey } = opts;

  if (clerkUIUrl) {
    return clerkUIUrl;
  }

  const scriptHost = buildScriptHost({ publishableKey, proxyUrl, domain });
  const version = versionSelector(undefined, UI_PACKAGE_VERSION);
  return `https://${scriptHost}/npm/@clerk/ui@${version}/dist/ui.browser.js`;
};

export const buildClerkJSScriptAttributes = (options: LoadClerkJSScriptOptions) => {
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

export const buildClerkUIScriptAttributes = (options: LoadClerkUIScriptOptions) => {
  // TODO @nikos do we need this?
  return buildClerkJSScriptAttributes(options);
};

const applyAttributesToScript = (attributes: Record<string, string>) => (script: HTMLScriptElement) => {
  for (const attribute in attributes) {
    script.setAttribute(attribute, attributes[attribute]);
  }
};

export const buildScriptHost = (opts: { publishableKey: string; proxyUrl?: string; domain?: string }) => {
  const { proxyUrl, domain, publishableKey } = opts;

  if (!!proxyUrl && isValidProxyUrl(proxyUrl)) {
    return proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, '');
  } else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || '')) {
    return addClerkPrefix(domain);
  } else {
    return parsePublishableKey(publishableKey)?.frontendApi || '';
  }
};

function waitForPredicateWithTimeout(
  timeoutMs: number,
  predicate: () => boolean,
  rejectWith: Error,
  existingScript?: HTMLScriptElement,
): Promise<HTMLScriptElement | null> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const cleanup = (timeoutId: ReturnType<typeof setTimeout>, pollInterval: ReturnType<typeof setInterval>) => {
      clearTimeout(timeoutId);
      clearInterval(pollInterval);
    };

    // Bail out early if the script fails to load, instead of waiting for the entire timeout
    existingScript?.addEventListener('error', () => {
      cleanup(timeoutId, pollInterval);
      reject(rejectWith);
    });

    const checkAndResolve = () => {
      if (resolved) {
        return;
      }

      if (predicate()) {
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

      if (!predicate()) {
        reject(rejectWith);
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

export function setClerkJSLoadingErrorPackageName(packageName: string) {
  errorThrower.setPackageName({ packageName });
}

/**
 * @deprecated Use `loadClerkJSScript` instead. This alias will be removed in a future major version.
 */
export const loadClerkJsScript = loadClerkJSScript;

/**
 * @deprecated Use `clerkJSScriptUrl` instead. This alias will be removed in a future major version.
 */
export const clerkJsScriptUrl = clerkJSScriptUrl;

/**
 * @deprecated Use `buildClerkJSScriptAttributes` instead. This alias will be removed in a future major version.
 */
export const buildClerkJsScriptAttributes = buildClerkJSScriptAttributes;

/**
 * @deprecated Use `setClerkJSLoadingErrorPackageName` instead. This alias will be removed in a future major version.
 */
export const setClerkJsLoadingErrorPackageName = setClerkJSLoadingErrorPackageName;
