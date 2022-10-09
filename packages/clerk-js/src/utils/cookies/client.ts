import { createCookieHandler } from '@clerk/shared';

const CLIENT_COOKIE_NAME = '__client';

/**
 *
 * This cookie is usually exchanged as an HTTP-only cookie for every request and
 * is indicating a production user session or a development browser session.
 *
 * See more at https://docs.google.com/document/d/1Kv4fQFfoXb7NzO3a287hYZboTl3fQjQ3LLegLTJEwNE/edit
 *
 * For local development environments for which clerk domains are third-party,
 * we would need to handle this as a JavaScript initialized cookie.
 */
export const clientCookie = createCookieHandler(CLIENT_COOKIE_NAME);
