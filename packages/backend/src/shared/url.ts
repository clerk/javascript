import { isStaging } from './instance';

// TODO: use the same function from @clerk/shared once treeshakable
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

// TODO: Move to @clerk/shared as the same logic is used in @clerk/react
export const getClerkJsMajorVersionOrTag = (frontendApi: string, pkgVersion?: string) => {
  if (!pkgVersion && isStaging(frontendApi)) {
    return 'staging';
  }

  if (!pkgVersion) {
    return 'latest';
  }

  if (pkgVersion.includes('next')) {
    return 'next';
  }

  return pkgVersion.split('.')[0] || 'latest';
};

export const getScriptUrl = (
  frontendApi: string,
  { pkgVersion, clerkJSVersion }: { pkgVersion?: string; clerkJSVersion?: string },
) => {
  const noSchemeFrontendApi = frontendApi.replace(/http(s)?:\/\//, '');
  const major = getClerkJsMajorVersionOrTag(frontendApi, pkgVersion);
  return `https://${noSchemeFrontendApi}/npm/@clerk/clerk-js@${clerkJSVersion || major}/dist/clerk.browser.js`;
};
