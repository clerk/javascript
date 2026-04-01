import { CURRENT_DEV_INSTANCE_SUFFIXES, LEGACY_DEV_INSTANCE_SUFFIXES } from './constants';
import { isStaging } from './utils/instance';

/**
 *
 */
export function parseSearchParams(queryString = ''): URLSearchParams {
  if (queryString.startsWith('?')) {
    queryString = queryString.slice(1);
  }
  return new URLSearchParams(queryString);
}

/**
 *
 */
export function stripScheme(url = ''): string {
  return (url || '').replace(/^.+:\/\//, '');
}

/**
 *
 */
export function addClerkPrefix(str: string | undefined) {
  if (!str) {
    return '';
  }
  let regex;
  if (str.match(/^(clerk\.)+\w*$/)) {
    regex = /(clerk\.)*(?=clerk\.)/;
  } else if (str.match(/\.clerk.accounts/)) {
    return str;
  } else {
    regex = /^(clerk\.)*/gi;
  }

  const stripped = str.replace(regex, '');
  return `clerk.${stripped}`;
}

/**
 *
 * Retrieve the clerk-js major tag using the major version from the pkgVersion
 * param or use the frontendApi to determine if the canary tag should be used.
 * The default tag is `latest`.
 */
export const getClerkJsMajorVersionOrTag = (frontendApi: string, version?: string) => {
  if (!version && isStaging(frontendApi)) {
    return 'canary';
  }

  if (!version) {
    return 'latest';
  }

  return version.split('.')[0] || 'latest';
};

/**
 *
 * Retrieve the clerk-js script url from the frontendApi and the major tag
 * using the {@link getClerkJsMajorVersionOrTag} or a provided clerkJSVersion tag.
 */
export const getScriptUrl = (frontendApi: string, { clerkJSVersion }: { clerkJSVersion?: string }) => {
  const noSchemeFrontendApi = frontendApi.replace(/http(s)?:\/\//, '');
  const major = getClerkJsMajorVersionOrTag(frontendApi, clerkJSVersion);
  return `https://${noSchemeFrontendApi}/npm/@clerk/clerk-js@${clerkJSVersion || major}/dist/clerk.browser.js`;
};

// Returns true for hosts such as:
// * accounts.foo.bar-13.lcl.dev
// * accounts.foo.bar-13.lclstage.dev
// * accounts.foo.bar-13.dev.lclclerk.com
/**
 *
 */
export function isLegacyDevAccountPortalOrigin(host: string): boolean {
  return LEGACY_DEV_INSTANCE_SUFFIXES.some(legacyDevSuffix => {
    return host.startsWith('accounts.') && host.endsWith(legacyDevSuffix);
  });
}

// Returns true for hosts such as:
// * foo-bar-13.accounts.dev
// * foo-bar-13.accountsstage.dev
// * foo-bar-13.accounts.lclclerk.com
// But false for:
// * foo-bar-13.clerk.accounts.lclclerk.com
/**
 *
 */
export function isCurrentDevAccountPortalOrigin(host: string): boolean {
  return CURRENT_DEV_INSTANCE_SUFFIXES.some(currentDevSuffix => {
    return host.endsWith(currentDevSuffix) && !host.endsWith('.clerk' + currentDevSuffix);
  });
}

/* Functions below are taken from https://github.com/unjs/ufo/blob/main/src/utils.ts. LICENSE: MIT */

const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;

/**
 *
 */
export function hasTrailingSlash(input = '', respectQueryAndFragment?: boolean): boolean {
  if (!respectQueryAndFragment) {
    return input.endsWith('/');
  }
  return TRAILING_SLASH_RE.test(input);
}

/**
 *
 */
export function withTrailingSlash(input = '', respectQueryAndFragment?: boolean): string {
  if (!respectQueryAndFragment) {
    return input.endsWith('/') ? input : input + '/';
  }
  if (hasTrailingSlash(input, true)) {
    return input || '/';
  }
  let path = input;
  let fragment = '';
  const fragmentIndex = input.indexOf('#');
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split('?');
  return s0 + '/' + (s.length > 0 ? `?${s.join('?')}` : '') + fragment;
}

/**
 *
 */
export function withoutTrailingSlash(input = '', respectQueryAndFragment?: boolean): string {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || '/';
  }
  if (!hasTrailingSlash(input, true)) {
    return input || '/';
  }
  let path = input;
  let fragment = '';
  const fragmentIndex = input.indexOf('#');
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split('?');
  return (s0.slice(0, -1) || '/') + (s.length > 0 ? `?${s.join('?')}` : '') + fragment;
}

/**
 *
 */
export function hasLeadingSlash(input = ''): boolean {
  return input.startsWith('/');
}

/**
 *
 */
export function withoutLeadingSlash(input = ''): string {
  return (hasLeadingSlash(input) ? input.slice(1) : input) || '/';
}

/**
 *
 */
export function withLeadingSlash(input = ''): string {
  return hasLeadingSlash(input) ? input : '/' + input;
}

/**
 *
 */
export function cleanDoubleSlashes(input = ''): string {
  return input
    .split('://')
    .map(string_ => string_.replace(/\/{2,}/g, '/'))
    .join('://');
}

/**
 *
 */
export function isNonEmptyURL(url: string) {
  return url && url !== '/';
}

const JOIN_LEADING_SLASH_RE = /^\.?\//;

/**
 *
 */
export function joinURL(base: string, ...input: string[]): string {
  let url = base || '';

  for (const segment of input.filter(url => isNonEmptyURL(url))) {
    if (url) {
      // TODO: Handle .. when joining
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, '');
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }

  return url;
}

/* Code below is taken from https://github.com/vercel/next.js/blob/fe7ff3f468d7651a92865350bfd0f16ceba27db5/packages/next/src/shared/lib/utils.ts. LICENSE: MIT */

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
export const isAbsoluteUrl = (url: string) => ABSOLUTE_URL_REGEX.test(url);
