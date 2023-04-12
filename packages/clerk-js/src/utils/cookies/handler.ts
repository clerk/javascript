import { addYears } from '@clerk/shared';
import type { ClientResource } from '@clerk/types';

import { getAllETLDs } from '../url';
import { clientCookie } from './client';
import { clientUatCookie } from './client_uat';
import { inittedCookie } from './initted';
import { sessionCookie } from './session';

const COOKIE_PATH = '/';
export type CookieHandler = ReturnType<typeof createCookieHandler>;
export const createCookieHandler = () => {
  // First party cookie helpers
  const getDevBrowserInittedCookie = () => inittedCookie.get();

  const setDevBrowserInittedCookie = () =>
    inittedCookie.set('1', {
      expires: addYears(Date.now(), 1),
      sameSite: 'Lax',
      path: COOKIE_PATH,
    });

  const removeSessionCookie = () => sessionCookie.remove();

  const setSessionCookie = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = 'Lax';
    const secure = window.location.protocol === 'https:';

    return sessionCookie.set(token, {
      expires,
      sameSite,
      secure,
    });
  };

  const getClientUatCookie = (): number => {
    return parseInt(clientUatCookie.get() || '0', 10);
  };

  const setClientUatCookie = (client: ClientResource | undefined) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = 'Strict';
    const secure = false;

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

  // Third party cookie helpers
  const ssoCookie = clientCookie;

  const removeAllDevBrowserCookies = () => {
    inittedCookie.remove({ path: COOKIE_PATH });
    // Delete cookie in a best-effort way by iterating all ETLDs
    getAllETLDs().forEach(domain => ssoCookie.remove({ domain, path: COOKIE_PATH }));
  };

  return {
    getDevBrowserInittedCookie,
    setDevBrowserInittedCookie,
    setSessionCookie,
    getClientUatCookie,
    setClientUatCookie,
    removeSessionCookie,
    removeAllDevBrowserCookies,
  };
};
