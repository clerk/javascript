import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_KEY } from '@clerk/shared/devBrowser';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { getSecureAttribute } from '../getSecureAttribute';
import { requiresSameSiteNone } from './requireSameSiteNone';

export type DevBrowserCookieHandler = {
  set: (devBrowser: string) => void;
  get: () => string | undefined;
  remove: () => void;
};

const getCookieAttributes = () => {
  const sameSite = inCrossOriginIframe() || requiresSameSiteNone() ? 'None' : 'Lax';
  const secure = getSecureAttribute(sameSite);
  return { sameSite, secure } as const;
};

/**
 * Create a long-lived JS cookie to store the dev browser token
 * ONLY for development instances.
 * The cookie is used to authenticate FAPI requests and pass
 * authentication from AP to the app.
 */
export const createDevBrowserCookie = (cookieSuffix: string): DevBrowserCookieHandler => {
  const devBrowserCookie = createCookieHandler(DEV_BROWSER_KEY);
  const suffixedDevBrowserCookie = createCookieHandler(getSuffixedCookieName(DEV_BROWSER_KEY, cookieSuffix));

  const get = () => suffixedDevBrowserCookie.get() || devBrowserCookie.get();

  const set = (devBrowser: string) => {
    const expires = addYears(Date.now(), 1);
    const { sameSite, secure } = getCookieAttributes();

    suffixedDevBrowserCookie.set(devBrowser, { expires, sameSite, secure });
    devBrowserCookie.set(devBrowser, { expires, sameSite, secure });
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
