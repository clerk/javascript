import type { AuthOptions, GetAuthFn } from '@clerk/backend/internal';
import type { Context } from 'hono';

/**
 * Retrieves the Clerk auth object from the Hono context.
 * Must be used after clerkMiddleware() has been applied.
 *
 * @example
 * ```ts
 * app.get('/protected', (c) => {
 *   const { userId } = getAuth(c);
 *   if (!userId) {
 *     return c.json({ error: 'Unauthorized' }, 401);
 *   }
 *   return c.json({ message: 'Hello!' });
 * });
 * ```
 *
 * @example Using acceptsToken for API keys
 * ```ts
 * app.get('/api', (c) => {
 *   const auth = getAuth(c, { acceptsToken: 'api_key' });
 *   // auth will be typed for API key tokens
 * });
 * ```
 */
export const getAuth: GetAuthFn<Context> = ((c: Context, options?: AuthOptions) => {
  const authFn = c.get('clerkAuth');

  if (!authFn) {
    throw new Error(
      'Clerk: getAuth() called without clerkMiddleware() being applied. Make sure to use clerkMiddleware() before calling getAuth().',
    );
  }

  return authFn(options);
}) as GetAuthFn<Context>;
