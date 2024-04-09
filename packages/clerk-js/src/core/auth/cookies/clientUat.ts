import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import type { ClientResource } from '@clerk/types';

import { inCrossOriginIframe } from '../../../utils';

const CLIENT_UAT_COOKIE_NAME = '__client_uat';

export type ClientUatCookieHandler = {
  set: (client: ClientResource | undefined) => void;
  get: () => number;
};

export const createClientUatCookie = (publishableKey: string, legacy = true): ClientUatCookieHandler => {
  const suffix = publishableKey.split('_').pop();
  const legacyClientUatCookie = createCookieHandler(CLIENT_UAT_COOKIE_NAME);
  const multipleAppsSessionCookie = createCookieHandler(`${CLIENT_UAT_COOKIE_NAME}_${suffix}`);

  const clientUatCookie = legacy ? legacyClientUatCookie : multipleAppsSessionCookie;

  const get = (): number => {
    return parseInt(clientUatCookie.get() || '0', 10);
  };

  const set = (client: ClientResource | undefined) => {
    legacyClientUatCookie.remove();

    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Strict';
    const secure = window.location.protocol === 'https:';

    // '0' indicates the user is signed out
    let val = '0';

    if (client && client.updatedAt && client.activeSessions.length > 0) {
      // truncate timestamp to seconds, since this is a unix timestamp
      val = Math.floor(client.updatedAt.getTime() / 1000).toString();
    }

    return clientUatCookie.set(val, {
      expires,
      sameSite,
      secure,
    });
  };

  return {
    set,
    get,
  };
};
