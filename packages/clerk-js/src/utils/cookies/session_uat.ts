import { createCookieHandler } from '@clerk/shared';

const SESSION_UAT_COOKIE_NAME = '__session_uat';

/**
 *
 * This is a long-lived JS cookie used to signal when the session was last updated
 * useful for session syncing across domains.
 *
 * It is used for both development and production instances
 */
export const sessionUatCookie = createCookieHandler(SESSION_UAT_COOKIE_NAME);
