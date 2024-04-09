import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../utils';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
  migrate: () => void;
};

/**
 *
 * This is a short-lived JS cookie used to store the current user JWT.
 *
 */
export const createSessionCookie = (publishableKey: string, withSuffix = false): SessionCookieHandler => {
  const suffix = publishableKey.split('_').pop();
  const sessionCookieLegacy = createCookieHandler(SESSION_COOKIE_NAME);
  const sessionCookieWithSuffix = createCookieHandler(`${SESSION_COOKIE_NAME}_${suffix}`);

  const sessionCookie = withSuffix ? sessionCookieWithSuffix : sessionCookieLegacy;

  const remove = () => {
    sessionCookie.remove();
  };

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

  const migrate = () => {
    if (!withSuffix || sessionCookieWithSuffix.get()) return;

    const legacyValue = sessionCookieLegacy.get();
    if (!legacyValue) return;

    sessionCookieWithSuffix.set(legacyValue);
    sessionCookieLegacy.remove();
  };

  return {
    set,
    remove,
    migrate,
  };
};
