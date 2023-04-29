import { createCookieHandler } from '@clerk/utils';

const INITTED_COOKIE_NAME = '__initted';

/**
 * Cookie indicating the development flow initialization.
 */
export const inittedCookie = createCookieHandler(INITTED_COOKIE_NAME);
