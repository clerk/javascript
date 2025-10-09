import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { inCrossOriginIframe } from '../../../utils';
import { getCookieDomain } from '../getCookieDomain';
import { getSecureAttribute } from '../getSecureAttribute';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
  get: () => string | undefined;
};

const getCookieAttributes = (): { sameSite: string; secure: boolean; partitioned: boolean } => {
  const sameSite = __BUILD_VARIANT_CHIPS__ ? 'None' : inCrossOriginIframe() ? 'None' : 'Lax';
  const secure = getSecureAttribute(sameSite);
  const partitioned = __BUILD_VARIANT_CHIPS__ && secure;
  return { sameSite, secure, partitioned };
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
    const attributes = getCookieAttributes();
    const domain = getCookieDomain();

    // Remove cookies with domain attribute
    sessionCookie.remove({ ...attributes, domain });
    suffixedSessionCookie.remove({ ...attributes, domain });

    // Also remove cookies without domain attribute for backward compatibility
    sessionCookie.remove(attributes);
    suffixedSessionCookie.remove(attributes);
  };

  const set = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const { sameSite, secure, partitioned } = getCookieAttributes();
    const domain = getCookieDomain();

    // Remove any existing cookies without a domain specified to ensure subdomain-scoped cookies are cleaned up
    sessionCookie.remove();
    suffixedSessionCookie.remove();

    // If setting Partitioned to true, remove the existing session cookies.
    // This is to avoid conflicts with the same cookie name without Partitioned attribute.
    if (partitioned) {
      remove();
    }

    sessionCookie.set(token, { domain, expires, partitioned, sameSite, secure });
    suffixedSessionCookie.set(token, { domain, expires, partitioned, sameSite, secure });
  };

  const get = () => suffixedSessionCookie.get() || sessionCookie.get();

  return {
    set,
    remove,
    get,
  };
};
