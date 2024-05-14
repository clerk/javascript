import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../utils';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
};

/**
 * Create a short-lived JS cookie to store the current user JWT.
 * The cookie is used by the Clerk backend SDKs to identify
 * the authenticated user.
 */
export const createSessionCookie = (): SessionCookieHandler => {
  const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);

  const remove = () => sessionCookie.remove();

  const set = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = window.location.protocol === 'https:';

    return sessionCookie.set(token, {
      expires,
      sameSite,
      secure,
    });
  };

  return {
    set,
    remove,
  };
};
