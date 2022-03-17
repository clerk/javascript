import { camelToSnake, isIPV4Address } from '@clerk/shared/utils/string';
import { loadScript } from 'utils';
import { SignUpResource } from '../../../types/dist';

declare global {
  export interface Window {
    tldts: {
      getDomain(
        hostname: string,
        { allowPrivateDomains }: { allowPrivateDomains: boolean },
      ): string;
    };
  }
}

export const DEV_OR_STAGING_SUFFIXES = [
  '.lcl.dev',
  '.stg.dev',
  '.lclstage.dev',
  '.stgstage.dev',
  '.dev.lclclerk.com',
  '.stg.lclclerk.com',
];

const devOrStagingUrlCache = new Map<string, boolean>();
const accountsCache = new Map<string, boolean>();

export function isDevOrStagingUrl(url: string | URL): boolean {
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
}

export function isAccountsHostedPages(
  url: string | URL = window.location.hostname,
): boolean {
  if (!url) {
    return false;
  }

  const hostname = typeof url === 'string' ? url : url.hostname;
  let res = accountsCache.get(hostname);
  if (res === undefined) {
    res = DEV_OR_STAGING_SUFFIXES.some(
      s => /^(https?:\/\/)?accounts\./.test(hostname) && hostname.endsWith(s),
    );
    accountsCache.set(hostname, res);
  }
  return res;
}

export async function getETLDPlusOne(
  hostname: string = window.location.hostname,
): Promise<string> {
  if (isIPV4Address(hostname)) {
    return hostname;
  }

  const parts = hostname.split('.');

  // Reuse dynamic loading of TLDParse library as in useTLDParser
  if (parts.length >= 3) {
    try {
      await loadScript(
        'https://cdn.jsdelivr.net/npm/tldts@5/dist/index.umd.min.js',
        {
          globalObject: window.tldts,
        },
      );

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

export function getAllETLDs(
  hostname: string = window.location.hostname,
): string[] {
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
}

interface BuildURLOptions<T> {
  skipOrigin?: boolean;
  stringify?: T;
}

/**
 *
 * buildURL(params: URLParams, options: BuildURLOptions): string
 *
 * Builds a URL safely by using the native URL() constructor.
 *
 * References:
 * https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * @param {URLParams} params
 * @param {BuildURLOptions} options
 * @returns {URL | string} Returns the URL href
 */
export function buildURL<B extends boolean>(
  params: BuildURLParams,
  options?: BuildURLOptions<B>,
): B extends true ? string : URL;

export function buildURL(
  params: BuildURLParams,
  options: BuildURLOptions<boolean> = {},
): URL | string {
  const { base, ...rest } = params;
  const url = new URL(base || window.location.href);
  Object.assign(url, rest);

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
 * @param {path} string
 * @returns {string} Returns the string without trailing slashes
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
  return base + (params.toString() ? '#/?' + params.toString() : '');
};

export const hasExternalAccountSignUpError = (signUp: SignUpResource): boolean => {
  const { externalAccount } = signUp.verifications
  return !!externalAccount.error;
}
