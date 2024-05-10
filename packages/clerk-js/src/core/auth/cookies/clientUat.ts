import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import type { ClientResource } from '@clerk/types';

import { inCrossOriginIframe } from '../../../utils';
import { getCookieDomain } from '../getCookieDomain';

const CLIENT_UAT_COOKIE_NAME = '__client_uat';

export type ClientUatCookieHandler = {
  set: (client: ClientResource | undefined) => void;
  get: () => number;
};

export const createClientUatCookie = (): ClientUatCookieHandler => {
  const clientUatCookie = createCookieHandler(CLIENT_UAT_COOKIE_NAME);

  const get = (): number => {
    return parseInt(clientUatCookie.get() || '0', 10);
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
    clientUatCookie.remove();

    return clientUatCookie.set(val, {
      expires,
      sameSite,
      domain,
      secure,
    });
  };

  return {
    set,
    get,
  };
};
