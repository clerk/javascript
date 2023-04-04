import { camelToSnake, createDevOrStagingUrlCache, isIPV4Address } from '@clerk/shared';
import type { SignUpResource } from '@clerk/types';

import { loadScript } from '../utils';
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
const CLERK_IMAGE_URL_BASES = [
  'https://images.clerk.com/',
  'https://images.clerk.dev/',
  'https://images.clerkstage.dev/',
  'https://images.lclclerk.com/',
];

export const DEV_OR_STAGING_SUFFIXES = [
  '.lcl.dev',
  '.stg.dev',
  '.lclstage.dev',
  '.stgstage.dev',
  '.dev.lclclerk.com',
  '.stg.lclclerk.com',
  '.accounts.lclclerk.com',
  'accountsstage.dev',
  'accounts.dev',
];

const BANNED_URI_PROTOCOLS = ['javascript:'] as const;

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
export { isDevOrStagingUrl };
const accountsCache = new Map<string, boolean>();

export function isAccountsHostedPages(url: string | URL = window.location.hostname): boolean {
  if (!url) {
    return false;
  }

  const hostname = typeof url === 'string' ? url : url.hostname;
  let res = accountsCache.get(hostname);
  if (res === undefined) {
    res = DEV_OR_STAGING_SUFFIXES.some(s => /^(https?:\/\/)?accounts\./.test(hostname) && hostname.endsWith(s));
    accountsCache.set(hostname, res);
  }
  return res;
}

export async function getETLDPlusOne(hostname: string = window.location.hostname): Promise<string> {
  if (isIPV4Address(hostname)) {
    return hostname;
  }

  const parts = hostname.split('.');

  // Reuse dynamic loading of TLDParse library as in useTLDParser
  if (parts.length >= 3) {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/tldts@5/dist/index.umd.min.js', {
        globalObject: window.tldts,
      });

      return window.tldts.getDomain(hostname, {
        allowPrivateDomains: true,
      });
    } catch (err) {
      console.error('Failed to load tldts: ', err);
    }

    // Poor mans domain splitting if dynamic loading of tldts fails
    const [, ...domain] = parts;
    return domain.join('.');
  }

  return hostname;
}

export function getAllETLDs(hostname: string = window.location.hostname): string[] {
  const parts = hostname.split('.');
  const memo = [];
  const domains = [];

  for (let i = parts.length - 1; i > 0; i--) {
    memo.unshift(parts[i]);
    domains.push(memo.join('.'));
  }

  return domains;
}

interface BuildURLParams extends Partial<URL> {
  base?: string;
  hashPath?: string;
  hashSearch?: string;
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
 * @param {BuildURLParams} params
 * @param {BuildURLOptions} options
 * @returns {URL | string} Returns the URL href
 */
export function buildURL<B extends boolean>(
  params: BuildURLParams,
  options?: BuildURLOptions<B>,
): B extends true ? string : URL;

export function buildURL(params: BuildURLParams, options: BuildURLOptions<boolean> = {}): URL | string {
  const { base, hashPath, hashSearch, searchParams, ...rest } = params;

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
      url.searchParams.set(key, value);
    });
  }

  Object.assign(url, rest);

  // Treat that hash part of the main URL as if it's another URL with a pathname and a search.
  // Another nested hash inside the top level hash (e.g. #my-hash#my-second-hash) is currently
  // not supported as there is no use case for it yet.
  if (hashPath || hashSearch) {
    // Parse the hash to a URL object
    const dummyUrlForHash = new URL(DUMMY_URL_BASE + url.hash.substring(1));

    // Join the current hash path and with the provided one
    dummyUrlForHash.pathname = joinPaths(dummyUrlForHash.pathname, hashPath || '');

    // Merge search params
    const hashSearchParams = getQueryParams(hashSearch || '');
    for (const [key, val] of Object.entries(hashSearchParams)) {
      dummyUrlForHash.searchParams.append(key, val as string);
    }

    // Keep just the pathname and the search
    const newHash = dummyUrlForHash.href.replace(DUMMY_URL_BASE, '');

    // Assign them to the hash of the main url
    url.hash = newHash;
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
 * @param {URL | string} url
 * @returns {string} Returns the URL href without the origin
 */
export function stripOrigin(url: URL | string): string {
  url = toURL(url);
  return url.href.replace(url.origin, '');
}

/**
 * trimTrailingSlash(path: string): string
 *
 * Strips the trailing slashes from a string
 *
 * @returns {string} Returns the string without trailing slashes
 * @param path
 */
export const trimTrailingSlash = (path: string): string => {
  return (path || '').replace(/\/+$/, '');
};

export const appendAsQueryParams = (
  baseUrl: string | URL,
  urls: Record<string, string | URL | null | undefined> = {},
): string => {
  const base = toURL(baseUrl);
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(urls)) {
    if (!val) {
      continue;
    }
    const url = toURL(val);
    const sameOrigin = base.origin === url.origin;
    params.append(camelToSnake(key), sameOrigin ? stripOrigin(url) : url + '');
  }

  // The following line will prepend the hash with a `/`.
  // This is required for ClerkJS Components Hash router to work as expected
  // as it treats the hash as sub-path with its nested querystring parameters.
  return base + (params.toString() ? '#/?' + params.toString() : '');
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

export function isValidUrl(val: unknown, opts?: { includeRelativeUrls?: boolean }): val is string {
  const { includeRelativeUrls = false } = opts || {};
  if (!val && !includeRelativeUrls) {
    return false;
  }

  try {
    new URL(val as string, includeRelativeUrls ? DUMMY_URL_BASE : undefined);
    return true;
  } catch (e) {
    return false;
  }
}

export function isDataUri(val?: string): val is string {
  if (!isValidUrl(val)) {
    return false;
  }

  return new URL(val).protocol === 'data:';
}

export function hasBannedProtocol(val: string | URL) {
  if (!isValidUrl(val)) {
    return false;
  }
  const protocol = new URL(val).protocol;
  return BANNED_URI_PROTOCOLS.some(bp => bp === protocol);
}

export const isClerkImage = (src?: string): boolean => {
  return !!CLERK_IMAGE_URL_BASES.some(base => src?.includes(base));
};

export const generateSrc = ({ src, width }: { src?: string; width: number }) => {
  if (!isValidUrl(src) || isDataUri(src)) {
    return src;
  }

  const newSrc = new URL(src);
  if (width) {
    newSrc.searchParams.append('width', width?.toString());
  }

  return newSrc.href;
};

export const generateSrcSet = ({
  src,
  width,
  xDescriptors,
}: {
  src?: string;
  width: number;
  xDescriptors: number[];
}) => {
  if (!src) {
    return '';
  }

  return xDescriptors.map(i => `${generateSrc({ src, width: width * i })} ${i}x`).toString();
};

/**
 * Creates a new URL by merging a fragment-based URL, if found.
 * The result URL has the original and the fragment pathnames appended
 * and also includes all search params from both places.
 *
 * @example
 * Input
 * https://accounts.clerk.com/sign-in?user_param=hello#/verify/factor-one?redirect_url=/protected
 * Return value:
 * https://accounts.clerk.com/sign-in/verify/factor-one?user_param=hello&redirect_url=/protected
 */
export const mergeFragmentIntoUrl = (_url: string | URL): URL => {
  const url = new URL(_url);
  const hasUrlInFragment = url.hash.startsWith('#/');

  if (!hasUrlInFragment) {
    return url;
  }

  const fragmentUrl = new URL(url.hash.replace('#/', '/'), url.href);
  const mergedPathname = [url.pathname, fragmentUrl.pathname]
    .map(s => s.split('/'))
    .flat()
    .filter(Boolean)
    .join('/');

  const mergedUrl = new URL(mergedPathname, url);

  url.searchParams.forEach((val, key) => {
    mergedUrl.searchParams.set(key, val);
  });

  fragmentUrl.searchParams.forEach((val, key) => {
    mergedUrl.searchParams.set(key, val);
  });

  return mergedUrl;
};
