import { isCurrentDevAccountPortalOrigin, isLegacyDevAccountPortalOrigin } from '@clerk/shared/url';

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
