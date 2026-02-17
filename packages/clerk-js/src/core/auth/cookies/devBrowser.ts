import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { inCrossOriginIframe } from '../../../utils';
import { getSecureAttribute } from '../getSecureAttribute';
import { requiresSameSiteNone } from './requireSameSiteNone';

export type DevBrowserCookieHandler = {
  set: (jwt: string) => void;
  get: () => string | undefined;
  remove: () => void;
};

const getCookieAttributes = (): { sameSite: string; secure: boolean } => {
  const sameSite = inCrossOriginIframe() || requiresSameSiteNone() ? 'None' : 'Lax';
  const secure = getSecureAttribute(sameSite);
  return { sameSite, secure };
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
    const { sameSite, secure } = getCookieAttributes();

    suffixedDevBrowserCookie.set(jwt, { expires, sameSite, secure });
    devBrowserCookie.set(jwt, { expires, sameSite, secure });
  };

  const remove = () => {
    const attributes = getCookieAttributes();
    suffixedDevBrowserCookie.remove(attributes);
    devBrowserCookie.remove(attributes);
  };

  return {
    get,
    set,
    remove,
  };
};
