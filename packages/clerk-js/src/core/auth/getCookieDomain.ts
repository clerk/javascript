import { createCookieHandler } from '@clerk/shared/cookie';

/**
 * Determines the eTLD+1 domain, which is where we want the cookies to be set.
 * This aligns with logic in FAPI, which is important to ensure we don't run into
 * a scenario where two __client_uat cookies are present.
 */
let cachedETLDPlusOne: string;
const eTLDCookie = createCookieHandler('__clerk_test_etld');

/**
 * @param hostname - The hostname to determine the eTLD+1 for.
 * @param cookieHandler - The cookie handler to use for the eTLD+1 probe.
 * @param cookieAttributes - Optional cookie attributes (sameSite, secure) to use
 *   during the eTLD+1 probe. These should match the attributes that will be used
 *   when setting the actual cookie, so the probe accurately reflects whether a
 *   domain-scoped cookie can be set in the current context.
 */
export function getCookieDomain(
  hostname = window.location.hostname,
  cookieHandler = eTLDCookie,
  cookieAttributes?: { sameSite?: string; secure?: boolean },
) {
  // only compute it once per session to avoid unnecessary cookie ops
  if (cachedETLDPlusOne) {
    return cachedETLDPlusOne;
  }

  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
    return hostname;
  }

  const hostnameParts = hostname.split('.');

  // Account for custom hosts defined locally, e.g. 127.0.0.1 -> local-app
  if (hostnameParts.length === 1) {
    return hostname;
  }

  // we know for sure that the first entry is definitely a TLD, skip it
  for (let i = hostnameParts.length - 2; i >= 0; i--) {
    const eTLD = hostnameParts.slice(i).join('.');
    cookieHandler.set('1', { ...cookieAttributes, domain: eTLD });

    const res = cookieHandler.get();
    if (res === '1') {
      cookieHandler.remove({ ...cookieAttributes, domain: eTLD });
      cachedETLDPlusOne = eTLD;
      return eTLD;
    }

    cookieHandler.remove({ ...cookieAttributes, domain: eTLD });
  }

  // Fallback to hostname to ensure domain-scoped cookie rather than host-only.
  // In restricted contexts (e.g. cross-origin iframes), the set() will silently
  // fail — which is preferable to creating a host-only cookie that conflicts
  // with domain-scoped cookies set by non-iframe contexts.
  cachedETLDPlusOne = hostname;
  return hostname;
}
