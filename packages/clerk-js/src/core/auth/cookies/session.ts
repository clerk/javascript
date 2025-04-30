import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { inCrossOriginIframe } from '../../../utils';
import { getSecureAttribute } from '../getSecureAttribute';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
  get: () => string | undefined;
};

/**
 * Create a short-lived JS cookie to store the current user JWT.
 * The cookie is used by the Clerk backend SDKs to identify
 * the authenticated user.
 */
export const createSessionCookie = (cookieSuffix: string): SessionCookieHandler => {
  const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);
  const suffixedSessionCookie = createCookieHandler(getSuffixedCookieName(SESSION_COOKIE_NAME, cookieSuffix));

  const remove = () => {
    sessionCookie.remove();
    suffixedSessionCookie.remove();
  };

  const set = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = __BUILD_VARIANT_CHIPS__ ? 'None' : (inCrossOriginIframe() ? 'None' : 'Lax');
    const secure = getSecureAttribute(sameSite);
    const partitioned = __BUILD_VARIANT_CHIPS__ && secure;

    // If setting Partitioned to true, remove the existing session cookies.
    // This is to avoid conflicts with the same cookie name without Partitioned attribute.
    if (partitioned) {
      remove();
    }

    sessionCookie.set(token, { expires, sameSite, secure, partitioned });
    suffixedSessionCookie.set(token, { expires, sameSite, secure, partitioned });
  };

  const get = () => suffixedSessionCookie.get() || sessionCookie.get();

  return {
    set,
    remove,
    get,
  };
};
