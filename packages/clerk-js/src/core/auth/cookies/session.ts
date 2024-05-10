import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../utils';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
};

export const createSessionCookie = (): SessionCookieHandler => {
  /**
   *
   * This is a short-lived JS cookie used to store the current user JWT.
   *
   */
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
