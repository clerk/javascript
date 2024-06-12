import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { getSuffixedCookieName } from '@clerk/shared/keys';
import type { ClientResource } from '@clerk/types';

import { inCrossOriginIframe } from '../../../utils';
import { getCookieDomain } from '../getCookieDomain';

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
    const sameSite = inCrossOriginIframe() ? 'None' : 'Strict';
    const secure = window.location.protocol === 'https:';
    const domain = getCookieDomain();

    // '0' indicates the user is signed out
    let val = '0';

    if (client && client.updatedAt && client.activeSessions.length > 0) {
      // truncate timestamp to seconds, since this is a unix timestamp
      val = Math.floor(client.updatedAt.getTime() / 1000).toString();
    }

    // Removes any existing cookies without a domain specified to ensure the change doesn't break existing sessions.
    suffixedClientUatCookie.remove();
    clientUatCookie.remove();

    suffixedClientUatCookie.set(val, { expires, sameSite, domain, secure });
    clientUatCookie.set(val, { expires, sameSite, domain, secure });
  };

  return {
    set,
    get,
  };
};
