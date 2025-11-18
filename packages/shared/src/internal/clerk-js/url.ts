import { globs } from '../../globs';
import { createDevOrStagingUrlCache } from '../../keys';
import { logger } from '../../logger';
import type { SignUpResource } from '../../types';
import { camelToSnake } from '../../underscore';
import { isCurrentDevAccountPortalOrigin, isLegacyDevAccountPortalOrigin } from '../../url';
import { joinPaths } from './path';
import { getQueryParams } from './querystring';

declare global {
  export interface Window {
    tldts: {
      getDomain(hostname: string, { allowPrivateDomains }: { allowPrivateDomains: boolean }): string;
    };
  }
}

// This is used as a dummy base when we need to invoke "new URL()" but we don't care about the URL origin.
const DUMMY_URL_BASE = 'http://clerk-dummy';

const BANNED_URI_PROTOCOLS = ['javascript:'] as const;

// Protocols that are dangerous specifically for href attributes in links
const BANNED_HREF_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'blob:'] as const;

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
export { isDevOrStagingUrl };
const accountPortalCache = new Map<string, boolean>();

export function isDevAccountPortalOrigin(hostname: string = window.location.hostname): boolean {
  if (!hostname) {
    return false;
  }

  let res = accountPortalCache.get(hostname);

  if (res === undefined) {
    res = isLegacyDevAccountPortalOrigin(hostname) || isCurrentDevAccountPortalOrigin(hostname);
    accountPortalCache.set(hostname, res);
  }

  return res;
}

export function getETLDPlusOneFromFrontendApi(frontendApi: string): string {
  return frontendApi.replace('clerk.', '');
}

interface BuildURLParams extends Partial<URL> {
  base?: string;
  hashPath?: string;
  hashSearch?: string;
  hashSearchParams?: URLSearchParams | Record<string, string> | Array<URLSearchParams | Record<string, string>>;
}

interface BuildURLOptions<T> {
  skipOrigin?: boolean;
  stringify?: T;
}

/**
 *
 * buildURL(params: URLParams, options: BuildURLOptions): string
 *
 * Builds a URL safely by using the native URL() constructor. It can
 * also build a secondary path and search URL that lives inside the hash
 * of the main URL. For example:
 *
 * https://foo.com/bar?qux=42#/hash-bar?hash-qux=42
 *
 * References:
 * https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * @param params
 * @param options
 * @returns Returns the URL href
 */
export function buildURL<B extends boolean>(
  params: BuildURLParams,
  options?: BuildURLOptions<B>,
): B extends true ? string : URL;

export function buildURL(params: BuildURLParams, options: BuildURLOptions<boolean> = {}): URL | string {
  const { base, hashPath, hashSearch, searchParams, hashSearchParams, ...rest } = params;

  let fallbackBase = '';
  // This check is necessary for React native environments where window is undefined.
  // TODO: Refactor all window and document usages in clerk-js and import them from
  // a single file that will be mocked easily in React native environments.
  if (typeof window !== 'undefined' && !!window.location) {
    fallbackBase = window.location.href;
  } else {
    fallbackBase = 'http://react-native-fake-base-url';
  }

  const url = new URL(base || '', fallbackBase);

  // Properly copy URLSearchParams
  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(camelToSnake(key), value);
      }
    });
  }

  Object.assign(url, rest);

  // Treat that hash part of the main URL as if it's another URL with a pathname and a search.
  // Another nested hash inside the top level hash (e.g. #my-hash#my-second-hash) is currently
  // not supported as there is no use case for it yet.
  if (hashPath || hashSearch || hashSearchParams) {
    // Parse the hash to a URL object
    const dummyUrlForHash = new URL(DUMMY_URL_BASE + url.hash.substring(1));

    // Join the current hash path and with the provided one
    dummyUrlForHash.pathname = joinPaths(dummyUrlForHash.pathname, hashPath || '');

    // Merge search params from hashSearch string
    const searchParamsFromHashSearchString = getQueryParams(hashSearch || '');
    for (const [key, val] of Object.entries(searchParamsFromHashSearchString)) {
      dummyUrlForHash.searchParams.append(key, val);
    }

    // Merge search params from the hashSearchParams object
    if (hashSearchParams) {
      const paramsArr = Array.isArray(hashSearchParams) ? hashSearchParams : [hashSearchParams];
      for (const _params of paramsArr) {
        if (!(_params instanceof URLSearchParams) && typeof _params !== 'object') {
          continue;
        }
        const params = new URLSearchParams(_params);
        params.forEach((value, key) => {
          if (value !== null && value !== undefined) {
            dummyUrlForHash.searchParams.set(camelToSnake(key), value);
          }
        });
      }
    }

    // Keep just the pathname and the  search
    const newHash = dummyUrlForHash.href.replace(DUMMY_URL_BASE, '');

    // if the hash is `/`, it means that nothing new was added to the hash
    // so we can skip assigning it to the hash of the main url
    if (newHash !== '/') {
      // Assign them to the hash of the main url
      url.hash = newHash;
    }
  }

  const { stringify, skipOrigin } = options;
  if (stringify) {
    return skipOrigin ? url.href.replace(url.origin, '') : url.href;
  }
  return url;
}

export function toURL(url: string | URL): URL {
  return new URL(url.toString(), window.location.origin);
}

/**
 *
 * stripOrigin(url: URL | string): string
 *
 * Strips the origin part of a URL and preserves path, search and hash is applicable
 *
 * References:
 * https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * @param url
 * @returns Returns the URL href without the origin
 */
export function stripOrigin(url: URL | string): string {
  // In non-browser environments `window.location.origin` might not be available
  // if not polyfilled, so we can't construct a URL object with the `url` string
  // note: in that case, we can't easily strip the origin, so we return the original string
  if (typeof window.location === 'undefined' && typeof url === 'string') {
    return url;
  }

  url = toURL(url);
  return url.href.replace(url.origin, '');
}

/**
 * trimTrailingSlash(path: string): string
 *
 * Strips the trailing slashes from a string
 *
 * @returns Returns the string without trailing slashes
 *
 * @param path
 */
export const trimTrailingSlash = (path: string): string => {
  return (path || '').replace(/\/+$/, '');
};

/**
 * trimLeadingSlash(path: string): string
 *
 * Strips the leading slashes from a string
 *
 * @returns Returns the string without leading slashes
 *
 * @param path
 */
export const trimLeadingSlash = (path: string): string => {
  return (path || '').replace(/^\/+/, '');
};

export const hasExternalAccountSignUpError = (signUp: SignUpResource): boolean => {
  const { externalAccount } = signUp.verifications;
  return !!externalAccount.error;
};

export function getSearchParameterFromHash({
  hash = window.location.hash,
  paramName,
}: {
  hash?: string;
  paramName: string;
}) {
  const h = hash.startsWith('#') ? hash.substring(1) : hash;
  const dummyUrlForHash = new URL(h, DUMMY_URL_BASE);
  return dummyUrlForHash.searchParams.get(paramName);
}

export function isValidUrl(val: string | URL | undefined | null): boolean {
  if (!val) {
    return false;
  }

  try {
    new URL(val as string);
    return true;
  } catch {
    return false;
  }
}

export function relativeToAbsoluteUrl(url: string, origin: string | URL): URL {
  try {
    return new URL(url);
  } catch {
    return new URL(url, origin);
  }
}

// Regular expression to detect disallowed patterns
const disallowedPatterns = [
  /\0/, // Null bytes
  /^\/\//, // Protocol-relative
  // eslint-disable-next-line no-control-regex
  /[\x00-\x1F]/, // Control characters
];

/**
 * Check for potentially problematic URLs that could have been crafted to intentionally bypass the origin check. Note that the URLs passed to this
 * function are assumed to be from an "allowed origin", so we are not executing origin-specific checks here.
 */
export function isProblematicUrl(url: URL): boolean {
  if (hasBannedProtocol(url)) {
    return true;
  }
  // Check against disallowed patterns
  for (const pattern of disallowedPatterns) {
    if (pattern.test(url.pathname)) {
      return true;
    }
  }

  return false;
}

export function isDataUri(val?: string): val is string {
  if (!val || !isValidUrl(val)) {
    return false;
  }

  return new URL(val).protocol === 'data:';
}

/**
 * Checks if a URL uses javascript: protocol.
 * This prevents some XSS attacks through javascript: URLs.
 *
 * IMPORTANT: This does not check for `data:` or other protocols which
 * are dangerous if used for links or setting the window location.
 *
 * @param val - The URL to check
 * @returns True if the URL contains a banned protocol, false otherwise
 */
export function hasBannedProtocol(val: string | URL) {
  if (!isValidUrl(val)) {
    return false;
  }
  const protocol = new URL(val).protocol;
  return BANNED_URI_PROTOCOLS.some(bp => bp === protocol);
}

/**
 * Checks if a URL contains a banned protocol for href attributes in links.
 * This prevents some XSS attacks through javascript:, data:, vbscript:, and blob: URLs.
 *
 * @param val - The URL to check
 * @returns True if the URL contains a banned protocol, false otherwise
 */
export function hasBannedHrefProtocol(val: string | URL): boolean {
  if (!isValidUrl(val)) {
    return false;
  }
  const protocol = new URL(val).protocol;
  return BANNED_HREF_PROTOCOLS.some(bp => bp === protocol);
}

/**
 * Sanitizes an href value by checking for dangerous protocols.
 * Returns null if the href contains a dangerous protocol, otherwise returns the original href.
 * This prevents some XSS attacks through javascript:, data:, vbscript:, and blob: URLs.
 *
 * @param href - The href value to sanitize
 * @returns The sanitized href or null if dangerous
 */
export function sanitizeHref(href: string | undefined | null): string | null {
  if (!href || href.trim() === '') {
    return null;
  }

  // For relative URLs (starting with / or # or ?), allow them through
  if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
    return href;
  }

  // For relative URLs without leading slash, allow them through
  if (!href.includes(':')) {
    return href;
  }

  // Check if it's a valid URL with a dangerous protocol
  try {
    const url = new URL(href);
    if (hasBannedHrefProtocol(url)) {
      return null;
    }
    return href;
  } catch {
    // If URL parsing fails, it's likely a relative URL or malformed
    // Allow relative URLs through, but be cautious with malformed ones
    return href;
  }
}

export const hasUrlInFragment = (_url: URL | string) => {
  return new URL(_url, DUMMY_URL_BASE).hash.startsWith('#/');
};

/**
 * Creates a new URL by merging a fragment-based URL, if found.
 * The result URL has the original and the fragment pathnames appended
 * and also includes all search params from both places.
 *
 * @example
 * ```ts
 * mergeFragmentIntoUrl('https://accounts.clerk.com/sign-in?user_param=hello#/verify/factor-one?redirect_url=/protected')
 * // Returns: 'https://accounts.clerk.com/sign-in/verify/factor-one?user_param=hello&redirect_url=/protected'
 * ```
 */
export const mergeFragmentIntoUrl = (_url: string | URL): URL => {
  const url = new URL(_url);

  if (!hasUrlInFragment(url)) {
    return url;
  }

  const fragmentUrl = new URL(url.hash.replace('#/', '/'), url.href);
  const mergedPathname = [url.pathname, fragmentUrl.pathname]
    .map(s => s.split('/'))
    .flat()
    .filter(Boolean)
    .join('/');

  const mergedUrl = new URL(mergedPathname, url.origin);

  url.searchParams.forEach((val, key) => {
    mergedUrl.searchParams.set(key, val);
  });

  fragmentUrl.searchParams.forEach((val, key) => {
    mergedUrl.searchParams.set(key, val);
  });

  return mergedUrl;
};

export const pathFromFullPath = (fullPath: string) => {
  return fullPath.replace(/CLERK-ROUTER\/(.*?)\//, '');
};

const frontendApiRedirectPathsWithUserInput: string[] = [
  '/oauth/authorize', // OAuth2 identify provider flow
];

const frontendApiRedirectPathsNoUserInput: string[] = [
  '/v1/verify', // magic links
  '/v1/tickets/accept', // ticket flow
  '/oauth/authorize-with-immediate-redirect', // OAuth 2 identity provider
  '/oauth/end_session', // OIDC logout
];

export function isRedirectForFAPIInitiatedFlow(frontendApi: string, redirectUrl: string): boolean {
  const url = new URL(redirectUrl, DUMMY_URL_BASE);
  const path = url.pathname;

  const isValidFrontendRedirectPath =
    frontendApiRedirectPathsWithUserInput.includes(path) || frontendApiRedirectPathsNoUserInput.includes(path);
  return frontendApi === url.host && isValidFrontendRedirectPath;
}

export function requiresUserInput(redirectUrl: string): boolean {
  const url = new URL(redirectUrl, DUMMY_URL_BASE);
  return frontendApiRedirectPathsWithUserInput.includes(url.pathname);
}

export const isAllowedRedirect =
  (allowedRedirectOrigins: Array<string | RegExp> | undefined, currentOrigin: string) => (_url: URL | string) => {
    let url = _url;
    if (typeof url === 'string') {
      url = relativeToAbsoluteUrl(url, currentOrigin);
    }

    if (!allowedRedirectOrigins) {
      return true;
    }

    const isSameOrigin = currentOrigin === url.origin;

    const isAllowed =
      !isProblematicUrl(url) &&
      (isSameOrigin ||
        allowedRedirectOrigins
          .map(origin => (typeof origin === 'string' ? globs.toRegexp(trimTrailingSlash(origin)) : origin))
          .some(origin => origin.test(trimTrailingSlash(url.origin))));

    if (!isAllowed) {
      logger.warnOnce(
        `Clerk: Redirect URL ${url} is not on one of the allowedRedirectOrigins, falling back to the default redirect URL.`,
      );
    }
    return isAllowed;
  };

export function createAllowedRedirectOrigins(
  allowedRedirectOrigins: Array<string | RegExp> | undefined,
  frontendApi: string,
  instanceType?: string,
): (string | RegExp)[] | undefined {
  if (Array.isArray(allowedRedirectOrigins) && !!allowedRedirectOrigins.length) {
    return allowedRedirectOrigins;
  }

  const origins: string[] = [];
  if (typeof window !== 'undefined' && !!window.location) {
    origins.push(window.location.origin);
  }

  origins.push(`https://${getETLDPlusOneFromFrontendApi(frontendApi)}`);
  origins.push(`https://*.${getETLDPlusOneFromFrontendApi(frontendApi)}`);

  if (instanceType === 'development') {
    origins.push(`https://${frontendApi}`);
  }

  return origins;
}
