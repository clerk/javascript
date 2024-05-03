import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';

import { inCrossOriginIframe } from '../../utils';

export const devBrowserCookie = createCookieHandler(DEV_BROWSER_JWT_KEY);

export const getDevBrowserCookie = () => devBrowserCookie.get();

export const setDevBrowserCookie = (jwt: string) => {
  const expires = addYears(Date.now(), 1);
  const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
  const secure = window.location.protocol === 'https:';

  return devBrowserCookie.set(jwt, {
    expires,
    sameSite,
    secure,
  });
};

export const removeDevBrowserCookie = () => devBrowserCookie.remove();
