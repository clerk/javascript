// TODO: This is a partial duplicate of part of packages/clerk-js/src/utils/url.ts
// TODO: To be removed when we can extract this utility to @clerk/shared

export const LEGACY_DEV_SUFFIXES = ['.lcl.dev', '.lclstage.dev', '.lclclerk.com'];
export const CURRENT_DEV_SUFFIXES = ['.accounts.dev', '.accountsstage.dev', '.accounts.lclclerk.com'];

const accountPortalCache = new Map<string, boolean>();

export function isDevAccountPortalOrigin(hostname: string): boolean {
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

// Returns true for hosts such as:
// * accounts.foo.bar-13.lcl.dev
// * accounts.foo.bar-13.lclstage.dev
// * accounts.foo.bar-13.dev.lclclerk.com
function isLegacyDevAccountPortalOrigin(host: string): boolean {
  return LEGACY_DEV_SUFFIXES.some(legacyDevSuffix => {
    return host.startsWith('accounts.') && host.endsWith(legacyDevSuffix);
  });
}

// Returns true for hosts such as:
// * foo-bar-13.accounts.dev
// * foo-bar-13.accountsstage.dev
// * foo-bar-13.accounts.lclclerk.com
// But false for:
// * foo-bar-13.clerk.accounts.lclclerk.com
function isCurrentDevAccountPortalOrigin(host: string): boolean {
  return CURRENT_DEV_SUFFIXES.some(currentDevSuffix => {
    return host.endsWith(currentDevSuffix) && !host.endsWith('.clerk' + currentDevSuffix);
  });
}
