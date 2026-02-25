import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { getSecureAttribute } from '../getSecureAttribute';
import { requiresSameSiteNone } from './requireSameSiteNone';

export type DevBrowserCookieHandler = {
  set: (jwt: string) => void;
  get: () => string | undefined;
  remove: () => void;
};

export type DevBrowserCookieOptions = {
  usePartitionedCookies: () => boolean;
};

const getCookieAttributes = (options: DevBrowserCookieOptions) => {
  const isPartitioned = options.usePartitionedCookies();
  const sameSite = isPartitioned ? 'None' : inCrossOriginIframe() || requiresSameSiteNone() ? 'None' : 'Lax';
  const secure = getSecureAttribute(sameSite);
  const partitioned = isPartitioned && secure;
  return { sameSite, secure, partitioned } as const;
};

/**
 * Create a long-lived JS cookie to store the dev browser token
 * ONLY for development instances.
 * The cookie is used to authenticate FAPI requests and pass
 * authentication from AP to the app.
 */
export const createDevBrowserCookie = (
  cookieSuffix: string,
  options: DevBrowserCookieOptions,
): DevBrowserCookieHandler => {
  const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_KEY);
  const suffixedDevBrowserCookie = createCookieHandler(getSuffixedCookieName(DEV_BROWSER_JWT_KEY, cookieSuffix));

  const get = () => suffixedDevBrowserCookie.get() || devBrowserCookie.get();

  const set = (jwt: string) => {
    const expires = addYears(Date.now(), 1);
    const { sameSite, secure, partitioned } = getCookieAttributes(options);

    // If setting Partitioned to true, remove the existing non-partitioned cookies.
    // A partitioned and non-partitioned cookie with the same name are treated as
    // different cookies by the browser, so we need to explicitly remove the old
    // non-partitioned versions. Plain remove() (without attributes) targets them.
    if (partitioned) {
      suffixedDevBrowserCookie.remove();
      devBrowserCookie.remove();
    }

    suffixedDevBrowserCookie.set(jwt, { expires, sameSite, secure, partitioned });
    devBrowserCookie.set(jwt, { expires, sameSite, secure, partitioned });
  };

  const remove = () => {
    const attributes = getCookieAttributes(options);
    suffixedDevBrowserCookie.remove(attributes);
    devBrowserCookie.remove(attributes);
  };

  return {
    get,
    set,
    remove,
  };
};
