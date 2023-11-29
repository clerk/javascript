import { CURRENT_DEV_INSTANCE_SUFFIXES, LEGACY_DEV_INSTANCE_SUFFIXES } from './constants';
import { isStaging } from './utils/instance';

export function parseSearchParams(queryString = ''): URLSearchParams {
  if (queryString.startsWith('?')) {
    queryString = queryString.slice(1);
  }
  return new URLSearchParams(queryString);
}

export function stripScheme(url = ''): string {
  return (url || '').replace(/^.+:\/\//, '');
}

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
export function isCurrentDevAccountPortalOrigin(host: string): boolean {
  return CURRENT_DEV_INSTANCE_SUFFIXES.some(currentDevSuffix => {
    return host.endsWith(currentDevSuffix) && !host.endsWith('.clerk' + currentDevSuffix);
  });
}

const SEPARATOR = '/';
const MULTIPLE_SEPARATOR_REGEX = new RegExp(SEPARATOR + '{1,}', 'g');

type PathString = string | null | undefined;

export function joinPaths(...args: PathString[]): string {
  return args
    .filter(p => p)
    .join(SEPARATOR)
    .replace(MULTIPLE_SEPARATOR_REGEX, SEPARATOR);
}
