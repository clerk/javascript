import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';

import { inCrossOriginIframe } from '../../../utils';

export type DevBrowserCookieHandler = {
  set: (jwt: string) => void;
  get: () => string | undefined;
  remove: () => void;
};

export const createDevBrowserCookie = (publishableKey: string, legacy = true): DevBrowserCookieHandler => {
  const suffix = publishableKey.split('_').pop();

  const legacyDevBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_KEY);
  const multipleAppsDevBrowserCookie = createCookieHandler(`${DEV_BROWSER_JWT_KEY}_${suffix}`);

  const devBrowserCookie = legacy ? legacyDevBrowserCookie : multipleAppsDevBrowserCookie;

  const get = () => devBrowserCookie.get();

  const set = (jwt: string) => {
    legacyDevBrowserCookie.remove();

    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = window.location.protocol === 'https:';

    return devBrowserCookie.set(jwt, {
      expires,
      sameSite,
      secure,
    });
  };

  const remove = () => {
    legacyDevBrowserCookie.remove();
    devBrowserCookie.remove();
  };

  return {
    get,
    set,
    remove,
  };
};
