import { createCookieHandler } from '@clerk/shared/cookie';

/**
 * Determines the eTLD+1 domain, which is where we want the cookies to be set.
 * This aligns with logic in FAPI, which is important to ensure we don't run into
 * a scenario where two __client_uat cookies are present.
 */
let eTLDPlusOne: string;
const eTLDCookie = createCookieHandler('__clerk_test_etld');

export function getCookieDomain(hostname = window.location.hostname, cookieHandler = eTLDCookie) {
  // only compute it once per session to avoid unnecessary cookie ops
  if (eTLDPlusOne) {
    return eTLDPlusOne;
  }

  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
    return hostname;
  }

  const hostnameParts = hostname.split('.');

  // we know for sure that the first entry is definitely a TLD, skip it
  for (let i = hostnameParts.length - 2; i >= 0; i--) {
    const eTLD = hostnameParts.slice(i).join('.');
    cookieHandler.set('1', { domain: eTLD });

    const res = cookieHandler.get();
    if (res === '1') {
      cookieHandler.remove({ domain: eTLD });
      return eTLD;
    }

    cookieHandler.remove({ domain: eTLD });
  }

  return;
}
