import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';

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
export const createDevBrowserCookie = (): DevBrowserCookieHandler => {
  const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_KEY);

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

  const remove = () => devBrowserCookie.remove();

  return {
    get,
    set,
    remove,
  };
};
