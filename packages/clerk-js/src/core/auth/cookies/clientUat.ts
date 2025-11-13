import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { getSuffixedCookieName } from '@clerk/shared/keys';
import type { ClientResource } from '@clerk/shared/types';

import { getCookieDomain } from '../getCookieDomain';
import { getSecureAttribute } from '../getSecureAttribute';

const CLIENT_UAT_COOKIE_NAME = '__client_uat';

export type ClientUatCookieHandler = {
  set: (client: ClientResource | undefined) => void;
  get: () => number;
};

/**
 * Create a long-lived JS cookie to store the client last updated_at timestamp
 * for development instances (for production instance is set by FAPI).
 * The cookie is used as hint from the Clerk Backend packages to identify
 * if the user is authenticated or not.
 */
export const createClientUatCookie = (cookieSuffix: string): ClientUatCookieHandler => {
  const clientUatCookie = createCookieHandler(CLIENT_UAT_COOKIE_NAME);
  const suffixedClientUatCookie = createCookieHandler(getSuffixedCookieName(CLIENT_UAT_COOKIE_NAME, cookieSuffix));

  const get = (): number => {
    const value = suffixedClientUatCookie.get() || clientUatCookie.get();
    return parseInt(value || '0', 10);
  };

  const set = (client: ClientResource | undefined) => {
    const expires = addYears(Date.now(), 1);
    /*
     * SameSite=Strict is used here to force requests originating from a different domain to resolve the auth state.
     * In development, it's possible that the auth state has changed on a different domain.
     * Generally, this is handled by redirectWithAuth() being called and relying on the dev browser ID in the URL,
     * but if that isn't used we rely on this. In production, nothing is cross-domain and Lax is used when client_uat is set from FAPI.
     */
    const sameSite = __BUILD_VARIANT_CHIPS__ ? 'None' : inCrossOriginIframe() ? 'None' : 'Strict';
    const secure = getSecureAttribute(sameSite);
    const partitioned = __BUILD_VARIANT_CHIPS__ && secure;
    const domain = getCookieDomain();

    // '0' indicates the user is signed out
    let val = '0';

    if (client && client.updatedAt && client.signedInSessions.length > 0) {
      // truncate timestamp to seconds, since this is a unix timestamp
      val = Math.floor(client.updatedAt.getTime() / 1000).toString();
    }

    // Removes any existing cookies without a domain specified to ensure the change doesn't break existing sessions.
    suffixedClientUatCookie.remove();
    clientUatCookie.remove();

    suffixedClientUatCookie.set(val, { domain, expires, partitioned, sameSite, secure });
    clientUatCookie.set(val, { domain, expires, partitioned, sameSite, secure });
  };

  return {
    set,
    get,
  };
};
