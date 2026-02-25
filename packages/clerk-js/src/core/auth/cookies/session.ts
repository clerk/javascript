import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { getSecureAttribute } from '../getSecureAttribute';
import { requiresSameSiteNone } from './requireSameSiteNone';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
  get: () => string | undefined;
};

export type SessionCookieOptions = {
  usePartitionedCookies: () => boolean;
};

const getCookieAttributes = (options: SessionCookieOptions) => {
  const isPartitioned = options.usePartitionedCookies();
  const sameSite = isPartitioned ? 'None' : inCrossOriginIframe() || requiresSameSiteNone() ? 'None' : 'Lax';
  const secure = getSecureAttribute(sameSite);
  const partitioned = isPartitioned && secure;
  return { sameSite, secure, partitioned } as const;
};

/**
 * Create a short-lived JS cookie to store the current user JWT.
 * The cookie is used by the Clerk backend SDKs to identify
 * the authenticated user.
 */
export const createSessionCookie = (cookieSuffix: string, options: SessionCookieOptions): SessionCookieHandler => {
  const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);
  const suffixedSessionCookie = createCookieHandler(getSuffixedCookieName(SESSION_COOKIE_NAME, cookieSuffix));

  const remove = () => {
    const attributes = getCookieAttributes(options);
    sessionCookie.remove(attributes);
    suffixedSessionCookie.remove(attributes);
  };

  const set = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const { sameSite, secure, partitioned } = getCookieAttributes(options);

    // If setting Partitioned to true, remove the existing non-partitioned cookies.
    // A partitioned and non-partitioned cookie with the same name are treated as
    // different cookies by the browser, so we need to explicitly remove the old
    // non-partitioned versions. Plain remove() (without attributes) targets them.
    if (partitioned) {
      sessionCookie.remove();
      suffixedSessionCookie.remove();
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
