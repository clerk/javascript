import { DEV_OR_STAGING_SUFFIXES, LEGACY_DEV_INSTANCE_SUFFIXES } from './constants';
import { isomorphicAtob } from './isomorphicAtob';
import { isomorphicBtoa } from './isomorphicBtoa';
import type { PublishableKey } from './types';

/**
 * Configuration options for parsing publishable keys.
 */
type ParsePublishableKeyOptions = {
  /** Whether to throw an error if parsing fails */
  fatal?: boolean;
  /** Custom domain to use for satellite instances */
  domain?: string;
  /** Proxy URL to use instead of the decoded frontend API */
  proxyUrl?: string;
  /** Whether this is a satellite instance */
  isSatellite?: boolean;
};

/** Prefix used for production publishable keys */
const PUBLISHABLE_KEY_LIVE_PREFIX = 'pk_live_';

/** Prefix used for development publishable keys */
const PUBLISHABLE_KEY_TEST_PREFIX = 'pk_test_';

/**
 * Regular expression that matches development frontend API keys.
 * Matches patterns like: foo-bar-13.clerk.accounts.dev.
 */
const PUBLISHABLE_FRONTEND_API_DEV_REGEX = /^(([a-z]+)-){2}([0-9]{1,2})\.clerk\.accounts([a-z.]*)(dev|com)$/i;

/**
 * Converts a frontend API URL into a base64-encoded publishable key.
 *
 * @param frontendApi - The frontend API URL (e.g., 'clerk.example.com').
 * @returns A base64-encoded publishable key with appropriate prefix (pk_live_ or pk_test_).
 */
export function buildPublishableKey(frontendApi: string): string {
  const isDevKey =
    PUBLISHABLE_FRONTEND_API_DEV_REGEX.test(frontendApi) ||
    (frontendApi.startsWith('clerk.') && LEGACY_DEV_INSTANCE_SUFFIXES.some(s => frontendApi.endsWith(s)));
  const keyPrefix = isDevKey ? PUBLISHABLE_KEY_TEST_PREFIX : PUBLISHABLE_KEY_LIVE_PREFIX;
  return `${keyPrefix}${isomorphicBtoa(`${frontendApi}$`)}`;
}

/**
 * Validates that a decoded publishable key has the correct format.
 * The decoded value should be a frontend API followed by exactly one '$' at the end.
 *
 * @param decoded - The decoded publishable key string to validate.
 * @returns `true` if the decoded key has valid format, `false` otherwise.
 */
function isValidDecodedPublishableKey(decoded: string): boolean {
  if (!decoded.endsWith('$')) {
    return false;
  }

  const withoutTrailing = decoded.slice(0, -1);
  if (withoutTrailing.includes('$')) {
    return false;
  }

  return withoutTrailing.includes('.');
}

export function parsePublishableKey(
  key: string | undefined,
  options: ParsePublishableKeyOptions & { fatal: true },
): PublishableKey;
export function parsePublishableKey(
  key: string | undefined,
  options?: ParsePublishableKeyOptions,
): PublishableKey | null;
/**
 * Parses and validates a publishable key, extracting the frontend API and instance type.
 *
 * @param key - The publishable key to parse.
 * @param options - Configuration options for parsing.
 * @param options.fatal
 * @param options.domain
 * @param options.proxyUrl
 * @param options.isSatellite
 * @returns Parsed publishable key object with instanceType and frontendApi, or null if invalid.
 *
 * @throws {Error} When options.fatal is true and key is missing or invalid.
 */
export function parsePublishableKey(
  key: string | undefined,
  options: { fatal?: boolean; domain?: string; proxyUrl?: string; isSatellite?: boolean } = {},
): PublishableKey | null {
  key = key || '';

  if (!key || !isPublishableKey(key)) {
    if (options.fatal && !key) {
      throw new Error(
        'Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys',
      );
    }
    if (options.fatal && !isPublishableKey(key)) {
      throw new Error('Publishable key not valid.');
    }
    return null;
  }

  const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? 'production' : 'development';

  let decodedFrontendApi: string;
  try {
    decodedFrontendApi = isomorphicAtob(key.split('_')[2]);
  } catch {
    if (options.fatal) {
      throw new Error('Publishable key not valid: Failed to decode key.');
    }
    return null;
  }

  if (!isValidDecodedPublishableKey(decodedFrontendApi)) {
    if (options.fatal) {
      throw new Error('Publishable key not valid: Decoded key has invalid format.');
    }
    return null;
  }

  let frontendApi = decodedFrontendApi.slice(0, -1);

  if (options.proxyUrl) {
    frontendApi = options.proxyUrl;
  } else if (instanceType !== 'development' && options.domain && options.isSatellite) {
    frontendApi = `clerk.${options.domain}`;
  }

  return {
    instanceType,
    frontendApi,
  };
}

/**
 * Checks if the provided key is a valid publishable key.
 *
 * @param key - The key to be checked. Defaults to an empty string if not provided.
 * @returns `true` if 'key' is a valid publishable key, `false` otherwise.
 */
export function isPublishableKey(key: string = '') {
  try {
    const hasValidPrefix = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX);

    if (!hasValidPrefix) {
      return false;
    }

    const parts = key.split('_');
    if (parts.length !== 3) {
      return false;
    }

    const encodedPart = parts[2];
    if (!encodedPart) {
      return false;
    }

    const decoded = isomorphicAtob(encodedPart);
    return isValidDecodedPublishableKey(decoded);
  } catch {
    return false;
  }
}

/**
 * Creates a memoized cache for checking if URLs are development or staging environments.
 * Uses a Map to cache results for better performance on repeated checks.
 *
 * @returns An object with an isDevOrStagingUrl method that checks if a URL is dev/staging.
 */
export function createDevOrStagingUrlCache() {
  const devOrStagingUrlCache = new Map<string, boolean>();

  return {
    /**
     * Checks if a URL is a development or staging environment.
     *
     * @param url - The URL to check (string or URL object).
     * @returns `true` if the URL is a development or staging environment, `false` otherwise.
     */
    isDevOrStagingUrl: (url: string | URL): boolean => {
      if (!url) {
        return false;
      }

      const hostname = typeof url === 'string' ? url : url.hostname;
      let res = devOrStagingUrlCache.get(hostname);
      if (res === undefined) {
        res = DEV_OR_STAGING_SUFFIXES.some(s => hostname.endsWith(s));
        devOrStagingUrlCache.set(hostname, res);
      }
      return res;
    },
  };
}

/**
 * Checks if a publishable key is for a development environment.
 * Supports both legacy format (test_) and new format (pk_test_).
 *
 * @param apiKey - The API key to check.
 * @returns `true` if the key is for development, `false` otherwise.
 */
export function isDevelopmentFromPublishableKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('pk_test_');
}

/**
 * Checks if a publishable key is for a production environment.
 * Supports both legacy format (live_) and new format (pk_live_).
 *
 * @param apiKey - The API key to check.
 * @returns `true` if the key is for production, `false` otherwise.
 */
export function isProductionFromPublishableKey(apiKey: string): boolean {
  return apiKey.startsWith('live_') || apiKey.startsWith('pk_live_');
}

/**
 * Checks if a secret key is for a development environment.
 * Supports both legacy format (test_) and new format (sk_test_).
 *
 * @param apiKey - The secret key to check.
 * @returns `true` if the key is for development, `false` otherwise.
 */
export function isDevelopmentFromSecretKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

/**
 * Checks if a secret key is for a production environment.
 * Supports both legacy format (live_) and new format (sk_live_).
 *
 * @param apiKey - The secret key to check.
 * @returns `true` if the key is for production, `false` otherwise.
 */
export function isProductionFromSecretKey(apiKey: string): boolean {
  return apiKey.startsWith('live_') || apiKey.startsWith('sk_live_');
}

/**
 * Generates a unique cookie suffix based on the publishable key using SHA-1 hashing.
 * The suffix is base64-encoded and URL-safe (+ and / characters are replaced).
 *
 * @param publishableKey - The publishable key to generate suffix from.
 * @param subtle - The SubtleCrypto interface to use for hashing (defaults to globalThis.crypto.subtle).
 * @returns A promise that resolves to an 8-character URL-safe base64 string.
 */
export async function getCookieSuffix(
  publishableKey: string,
  subtle: SubtleCrypto = globalThis.crypto.subtle,
): Promise<string> {
  const data = new TextEncoder().encode(publishableKey);
  const digest = await subtle.digest('sha-1', data);
  const stringDigest = String.fromCharCode(...new Uint8Array(digest));
  // Base 64 Encoding with URL and Filename Safe Alphabet: https://datatracker.ietf.org/doc/html/rfc4648#section-5
  return isomorphicBtoa(stringDigest).replace(/\+/gi, '-').replace(/\//gi, '_').substring(0, 8);
}

/**
 * Creates a suffixed cookie name by appending the cookie suffix to the base name.
 * Used to create unique cookie names based on the publishable key.
 *
 * @param cookieName - The base cookie name.
 * @param cookieSuffix - The suffix to append (typically generated by getCookieSuffix).
 * @returns The suffixed cookie name in format: `${cookieName}_${cookieSuffix}`.
 */
export const getSuffixedCookieName = (cookieName: string, cookieSuffix: string): string => {
  return `${cookieName}_${cookieSuffix}`;
};
