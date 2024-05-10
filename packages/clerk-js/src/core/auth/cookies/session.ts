import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../utils';

const SESSION_COOKIE_NAME = '__session';

/**
 *
 * This is a short-lived JS cookie used to store the current user JWT.
 *
 */
export const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);

export const removeSessionCookie = () => sessionCookie.remove();

export const setSessionCookie = (token: string) => {
  const expires = addYears(Date.now(), 1);
  const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
  const secure = window.location.protocol === 'https:';

  return sessionCookie.set(token, {
    expires,
    sameSite,
    secure,
  });
};
