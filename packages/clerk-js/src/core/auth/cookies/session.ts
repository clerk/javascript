import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../utils';
import { getSuffixedCookieName } from '../utils';

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
export const createSessionCookie = (publishableKey: string): SessionCookieHandler => {
  const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);
  const suffixedSessionCookie = createCookieHandler(getSuffixedCookieName(SESSION_COOKIE_NAME, publishableKey));

  const remove = () => {
    suffixedSessionCookie.remove();
    sessionCookie.remove();
  };

  const set = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = window.location.protocol === 'https:';

    suffixedSessionCookie.set(token, { expires, sameSite, secure });
    sessionCookie.set(token, { expires, sameSite, secure });
  };

  return {
    set,
    remove,
  };
};
