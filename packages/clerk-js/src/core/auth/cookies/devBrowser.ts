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

export type DevBrowserCookieOptions = {
  usePartitionedCookies: () => boolean;
};

const getCookieAttributes = (options: DevBrowserCookieOptions) => {
  const isPartitioned = options.usePartitionedCookies();
  const sameSite = isPartitioned || inCrossOriginIframe() || requiresSameSiteNone() ? 'None' : 'Lax';
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
  const devBrowserCookie = createCookieHandler(DEV_BROWSER_KEY);
  const suffixedDevBrowserCookie = createCookieHandler(getSuffixedCookieName(DEV_BROWSER_KEY, cookieSuffix));

  const get = () => suffixedDevBrowserCookie.get() || devBrowserCookie.get();

  const set = (devBrowser: string) => {
    const expires = addYears(Date.now(), 1);
    const { sameSite, secure, partitioned } = getCookieAttributes(options);

    // Remove old non-partitioned cookies — the browser treats partitioned and
    // non-partitioned cookies with the same name as distinct cookies.
    if (partitioned) {
      suffixedDevBrowserCookie.remove();
      devBrowserCookie.remove();
    }

    suffixedDevBrowserCookie.set(devBrowser, { expires, sameSite, secure, partitioned });
    devBrowserCookie.set(devBrowser, { expires, sameSite, secure, partitioned });
  };

  const remove = () => {
    const attributes = getCookieAttributes(options);
    suffixedDevBrowserCookie.remove(attributes);
    devBrowserCookie.remove(attributes);

    // Also remove non-partitioned variants — the browser treats partitioned and
    // non-partitioned cookies with the same name as distinct cookies.
    if (attributes.partitioned) {
      suffixedDevBrowserCookie.remove();
      devBrowserCookie.remove();
    }
  };

  return {
    get,
    set,
    remove,
  };
};
