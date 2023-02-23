import { addYears } from '@clerk/shared';
import { convertUint8ArrayToHex } from '@clerk/shared';
import type { BuildCookieName, ClientResource } from '@clerk/types';

import { buildURL, getAllETLDs } from '../url';
import { clientCookie } from './client';
import { clientUatCookie } from './client_uat';
import { inittedCookie } from './initted';
import { sessionCookie } from './session';

export const buildClientUatName = async (options: BuildCookieName) => {
  const { publishableKey, domain = '', proxyUrl = '', isSatellite = false } = options;

  const items = [] as string[];

  if (publishableKey) {
    items.push(publishableKey);
  }

  if (isSatellite && domain) {
    items.push(domain);
  }

  if (proxyUrl) {
    items.push(proxyUrl);
  }

  const stringValue = items.join('-');

  const encoder = new TextEncoder();
  const toUint8 = encoder.encode(stringValue);
  const buffer = await crypto.subtle.digest('SHA-1', toUint8);
  const hash = Array.from(new Uint8Array(buffer));

  return `__client_uat_${convertUint8ArrayToHex(hash).slice(0, 12)}`;
};

export const buildClerkDbJwtName = async (options: BuildCookieName) => {
  const { publishableKey, domain = '', proxyUrl = '', isSatellite = false } = options;

  const items = [] as string[];

  if (publishableKey) {
    items.push(publishableKey);
  }

  if (isSatellite && domain) {
    items.push(domain);
  }

  if (proxyUrl) {
    items.push(proxyUrl);
  }

  const stringValue = items.join('-');

  const encoder = new TextEncoder();
  const toUint8 = encoder.encode(stringValue);
  const buffer = await crypto.subtle.digest('SHA-1', toUint8);
  const hash = Array.from(new Uint8Array(buffer));

  return `clerk-db-jwt-${convertUint8ArrayToHex(hash).slice(0, 12)}`;
};

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

  const setClientUatCookie = async (client: ClientResource | undefined, options: BuildCookieName) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = 'Strict';
    const secure = false;

    // '0' indicates the user is signed out
    let val = '0';

    if (client && client.updatedAt && client.activeSessions.length > 0) {
      // truncate timestamp to seconds, since this is a unix timestamp
      val = Math.floor(client.updatedAt.getTime() / 1000).toString();
    }

    const clientUatName = await buildClientUatName(options);

    // also create with legacy __client_uat naming for backwards compatibility
    clientUatCookie.set(
      val,
      {
        expires,
        sameSite,
        secure,
      },
      '__client_uat',
    );

    return clientUatCookie.set(
      val,
      {
        expires,
        sameSite,
        secure,
      },
      clientUatName,
    );
  };

  // Third party cookie helpers
  const ssoCookie = clientCookie;

  const removeAllDevBrowserCookies = () => {
    inittedCookie.remove({ path: COOKIE_PATH });
    // Delete cookie in a best-effort way by iterating all ETLDs
    getAllETLDs().forEach(domain => ssoCookie.remove({ domain, path: COOKIE_PATH }));
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
    removeAllDevBrowserCookies,
    clearLegacyAuthV1SessionCookie,
  };
};
