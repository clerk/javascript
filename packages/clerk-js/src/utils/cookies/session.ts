import { createCookieHandler } from '@clerk/shared';

const SESSION_COOKIE_NAME = '__session';

/**
 *
 * This is a short-lived JS cookie used to store the current user JWT.
 *
 * For more information refer to the following document:
 *
 * https://docs.google.com/document/d/1F_vp7X4mhu0QXYG_89GVXnMoBlFZTjL33jMd4t120PM/edit#
 */
export const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);
