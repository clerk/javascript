import { addYears } from '@clerk/shared/utils/date';
import type { ClientResource } from '@clerk/types';
import { buildURL, getAllETLDs, getETLDPlusOne } from 'utils';

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

  // TODO: Clean up these cookie handlers after Auth v2 becomes the only authentication method
  // Dev Browser cookie will be handled 100% be local storage
  const getSSODevBrowserCookie = () => ssoCookie.get();

  const setSSODevBrowserCookie = async (token: string) => {
    const domain = await getETLDPlusOne();
    const expires = addYears(Date.now(), 1);
    const path = COOKIE_PATH;
    const inIframe = window.location !== window.parent.location;
    const sameSite = inIframe ? 'None' : 'Lax';
    const secure = sameSite === 'None' || window.location.protocol === 'https:';

    return ssoCookie.set(token, {
      domain,
      expires,
      path,
      sameSite,
      secure,
    });
  };

  const removeAllDevBrowserCookies = async (strict = true) => {
    inittedCookie.remove({ path: COOKIE_PATH });

    if (strict) {
      // Delete cookie accurately by calculating the ETLD+1 domain
      const domain = await getETLDPlusOne();
      ssoCookie.remove({ domain, path: COOKIE_PATH });
    } else {
      // Delete cookie in a best-effort way by iterating all ETLDs
      getAllETLDs().forEach(domain => ssoCookie.remove({ domain, path: COOKIE_PATH }));
    }
  };

  const clearLegacyAuthV1SessionCookie = async () => {
    if (!checkIfHttpOnlyAuthV1SessionCookieExists()) {
      return;
    }

    const clearSessionCookieUrl = buildURL(
      {
        base: `https://clerk.${window.location.host}`,
        pathname: 'v1/clear-session-cookie',
      },
      { stringify: false },
    );

    await fetch(clearSessionCookieUrl.toString(), {
      credentials: 'include',
    });
  };

  const checkIfHttpOnlyAuthV1SessionCookieExists = (): boolean => {
    if (document.cookie.indexOf('__session=') !== -1) {
      return false;
    }

    const d = new Date();
    d.setTime(d.getTime() + 1000);

    document.cookie = `__session=check;path=/;domain=${window.location.host};expires=${d.toUTCString()}`;
    const cookieExists = document.cookie.indexOf('__session=') === -1;
    document.cookie = `__session=;path=/;domain=${window.location.host};max-age=-1`;
    return cookieExists;
  };

  return {
    getDevBrowserInittedCookie,
    setDevBrowserInittedCookie,
    setSessionCookie,
    setClientUatCookie,
    removeSessionCookie,
    getSSODevBrowserCookie,
    setSSODevBrowserCookie,
    removeAllDevBrowserCookies,
    clearLegacyAuthV1SessionCookie,
  };
};
