import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { inCrossOriginIframe } from '../../../utils';

const SUFFIXED_COOKIES_COOKIE_NAME = '__clerk_suffixed_cookies';

export type SuffixedCookiesCookieHandler = {
  set: (enabled: boolean) => void;
};

/**
 * Create JS cookie as hint for the backend SDKs to allow them identify if the suffixed
 * cookies are supported in ClerkJS.
 * This cookie will be set by the ClerkJS in development instances with custom development domains
 * (eg host != frontendApi eTLD+1 domain) and by FAPI on all the other cases.
 */
export const createSuffixedCookiesCookie = (publishableKey: string): SuffixedCookiesCookieHandler => {
  const suffixedCookiesCookie = createCookieHandler(
    getSuffixedCookieName(SUFFIXED_COOKIES_COOKIE_NAME, publishableKey),
  );

  const set = (enabled: boolean) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = window.location.protocol === 'https:';

    suffixedCookiesCookie.set(enabled.toString(), { expires, sameSite, secure });
  };

  return {
    set,
  };
};
