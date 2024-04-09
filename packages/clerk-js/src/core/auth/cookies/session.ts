import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../utils';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
};

/**
 *
 * This is a short-lived JS cookie used to store the current user JWT.
 *
 */
export const createSessionCookie = (publishableKey: string, legacy = true): SessionCookieHandler => {
  const suffix = publishableKey.split('_').pop();
  const legacySessionCookie = createCookieHandler(SESSION_COOKIE_NAME);
  const multipleAppsSessionCookie = createCookieHandler(`${SESSION_COOKIE_NAME}_${suffix}`);

  const sessionCookie = legacy ? legacySessionCookie : multipleAppsSessionCookie;

  const remove = () => {
    legacySessionCookie.remove();
    sessionCookie.remove();
  };

  const set = (token: string) => {
    legacySessionCookie.remove();

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
