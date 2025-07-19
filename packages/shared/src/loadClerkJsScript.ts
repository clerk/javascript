import type { ClerkOptions, SDKMetadata, Without } from '@clerk/types';

import { isClerkJSLoadedBlocking, registerWithBlockingCoordinator } from './clerkJsBlockingCoordinator';
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
 * Hotloads the Clerk JS script using the blocking coordinator.
 *
 * This function integrates with the render-blocking coordinator that must be
 * set up before any ClerkJS scripts are rendered. The coordinator handles:
 * - Script already loaded successfully: resolves immediately
 * - Script is currently loading: waits for completion
 * - Script failed to load: attempts to load again
 * - No script exists: loads the script.
 *
 * The blocking coordinator ensures no duplicate network requests and proper
 * state management at the browser DOM level, preventing race conditions.
 *
 * @param opts - The options used to build the Clerk JS script URL and load the script.
 *               Must include a `publishableKey`.
 *
 * @example
 * loadClerkJsScript({ publishableKey: 'pk_' });
 */
const loadClerkJsScript = async (opts?: LoadClerkJsScriptOptions) => {
  if (!opts?.publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
    return;
  }

  try {
    const scriptUrl = clerkJsScriptUrl(opts);
    const attributes = buildClerkJsScriptAttributes(opts);

    // Check if blocking coordinator has already handled this
    if (isClerkJSLoadedBlocking()) {
      // ClerkJS is already loaded, return existing script element
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-clerk-js-script]');
      if (existingScript) {
        return existingScript;
      }
    }

    // Use blocking coordinator if available, otherwise fall back to loadScript
    if (typeof window !== 'undefined' && (window as any).__clerkJSBlockingCoordinator) {
      return new Promise<HTMLScriptElement>((resolve, reject) => {
        registerWithBlockingCoordinator({
          onLoad: () => {
            const script = document.querySelector<HTMLScriptElement>('script[data-clerk-js-script]');
            if (script) {
              resolve(script);
            } else {
              reject(new Error('ClerkJS loaded but script element not found'));
            }
          },
          onError: error => {
            reject(error);
          },
        });
      });
    } else {
      // Fallback to traditional loading if blocking coordinator is not available
      return await loadScript(scriptUrl, {
        ...attributes,
        async: true,
        crossOrigin: 'anonymous',
      });
    }
  } catch {
    throw new Error(FAILED_TO_LOAD_ERROR);
  }
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

export { loadClerkJsScript, buildClerkJsScriptAttributes, clerkJsScriptUrl };
export {
  getBlockingCoordinatorState as getClerkJSState,
  isClerkJSLoadedBlocking as isClerkJSLoaded,
  registerWithBlockingCoordinator as onClerkJSStateChange,
} from './clerkJsBlockingCoordinator';
export type { LoadClerkJsScriptOptions };
