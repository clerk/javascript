import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';

import { inCrossOriginIframe } from '../../../utils';

export type DevBrowserCookieHandler = {
  set: (jwt: string) => void;
  get: () => string | undefined;
  remove: () => void;
  migrate: () => void;
};

export const createDevBrowserCookie = (publishableKey: string, withSuffix = false): DevBrowserCookieHandler => {
  const suffix = publishableKey.split('_').pop();

  const devBrowserCookieLegacy = createCookieHandler(DEV_BROWSER_JWT_KEY);
  const devBrowserCookieWithSuffix = createCookieHandler(`${DEV_BROWSER_JWT_KEY}_${suffix}`);

  const devBrowserCookie = withSuffix ? devBrowserCookieWithSuffix : devBrowserCookieLegacy;

  const get = () => devBrowserCookie.get();

  const set = (jwt: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = window.location.protocol === 'https:';

    return devBrowserCookie.set(jwt, {
      expires,
      sameSite,
      secure,
    });
  };

  const migrate = () => {
    if (!withSuffix || devBrowserCookieWithSuffix.get()) return;

    const legacyValue = devBrowserCookieLegacy.get();
    if (!legacyValue) return;

    devBrowserCookieWithSuffix.set(legacyValue);
    devBrowserCookieLegacy.remove();
  };

  const remove = () => {
    devBrowserCookieLegacy.remove();
    devBrowserCookie.remove();
  };

  return {
    get,
    set,
    remove,
    migrate,
  };
};
