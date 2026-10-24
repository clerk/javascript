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

const partitionedCookieAttributes = {
  sameSite: 'None',
  secure: true,
  partitioned: true,
} as const;

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

  const cookies = [suffixedDevBrowserCookie, devBrowserCookie];

  const removeAll = () => {
    const attributes = getCookieAttributes(options);

    for (const cookie of cookies) {
      cookie.remove(attributes);
      cookie.remove();
      cookie.remove(partitionedCookieAttributes);
    }
  };

  const removeStaleAttributeVariants = (wrotePartitioned: boolean) => {
    for (const cookie of cookies) {
      if (wrotePartitioned) {
        cookie.remove({ sameSite: 'Lax', secure: getSecureAttribute('Lax'), partitioned: false });
        cookie.remove({ sameSite: 'None', secure: getSecureAttribute('None'), partitioned: false });
      } else {
        cookie.remove(partitionedCookieAttributes);
      }
    }
  };

  const set = (devBrowser: string) => {
    const expires = addYears(Date.now(), 1);
    const { sameSite, secure, partitioned } = getCookieAttributes(options);

    // Write both cookies first so a concurrent request never sees a hole
    // between remove() and set(). Then drop only the attribute variants
    // that are not the ones we just wrote.
    suffixedDevBrowserCookie.set(devBrowser, { expires, sameSite, secure, partitioned });
    devBrowserCookie.set(devBrowser, { expires, sameSite, secure, partitioned });
    removeStaleAttributeVariants(partitioned);
  };

  const remove = () => removeAll();

  return {
    get,
    set,
    remove,
  };
};
