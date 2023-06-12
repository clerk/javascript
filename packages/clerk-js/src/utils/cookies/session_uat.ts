import { createCookieHandler } from '@clerk/shared';

const SESSION_UAT_COOKIE_NAME = '__session_uat';

/**
 *
 * This is a long-lived JS cookie used in development instances, to
 * signal to the customer's backend (SDK) when the Client was last updated and
 * therefore when the SDK should re-concile the state with FAPI.
 *
 * For more information refer to the following document:
 *
 * https://docs.google.com/document/d/1PGAykkmPjx5Mtdi6j-yHc5Qy-uasjtcXnfGKDy3cHIE/edit#
 */

/**
 *
 * This is a short-lived JS cookie used to signal when the session was last updated
 * useful for session syncing across domains
 */
export const sessionUatCookie = createCookieHandler(SESSION_UAT_COOKIE_NAME);
