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
export const getClerkJsMajorVersionOrTag = (frontendApi: string, pkgVersion?: string) => {
  if (!pkgVersion && isStaging(frontendApi)) {
    return 'canary';
  }

  if (!pkgVersion) {
    return 'latest';
  }

  return pkgVersion.split('.')[0] || 'latest';
};

/**
 *
 * Retrieve the clerk-js script url from the frontendApi and the major tag
 * using the {@link getClerkJsMajorVersionOrTag} or a provided clerkJSVersion tag.
 */
export const getScriptUrl = (
  frontendApi: string,
  { pkgVersion = CLERK_JS_PACKAGE_VERSION, clerkJSVersion }: { pkgVersion?: string; clerkJSVersion?: string },
) => {
  const noSchemeFrontendApi = frontendApi.replace(/http(s)?:\/\//, '');
  const major = getClerkJsMajorVersionOrTag(frontendApi, pkgVersion);
  return `https://${noSchemeFrontendApi}/npm/@clerk/clerk-js@${clerkJSVersion || major}/dist/clerk.browser.js`;
};
