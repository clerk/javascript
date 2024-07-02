import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { inCrossOriginIframe } from '../../../utils';

export type DevBrowserCookieHandler = {
  set: (jwt: string) => void;
  get: () => string | undefined;
  remove: () => void;
};

/**
 * Create a long-lived JS cookie to store the dev browser token
 * ONLY for development instances.
 * The cookie is used to authenticate FAPI requests and pass
 * authentication from AP to the app.
 */
export const createDevBrowserCookie = (cookieSuffix: string): DevBrowserCookieHandler => {
  const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_KEY);
  const suffixedDevBrowserCookie = createCookieHandler(getSuffixedCookieName(DEV_BROWSER_JWT_KEY, cookieSuffix));

  const get = () => suffixedDevBrowserCookie.get() || devBrowserCookie.get();

  const set = (jwt: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = window.location.protocol === 'https:';

    suffixedDevBrowserCookie.set(jwt, { expires, sameSite, secure });
    devBrowserCookie.set(jwt, { expires, sameSite, secure });
  };

  const remove = () => {
    suffixedDevBrowserCookie.remove();
    devBrowserCookie.remove();
  };

  return {
    get,
    set,
    remove,
  };
};
