import type { AuthObject } from '@clerk/backend';
import { AuthStatus, constants } from '@clerk/backend/internal';
import type { H3Event } from 'h3';
import { createError, eventHandler, setResponseHeader } from 'h3';

import { clerkClient } from './clerkClient';
import { createInitialState, toWebRequest } from './utils';

type Handler = (event: H3Event) => void;

/**
 * Integrates Clerk authentication into your Nuxt application through Middleware.
 *
 * @param handler Optional callback function to handle the authenticated request
 *
 * @example
 * Basic usage:
 * ```ts
 * import { clerkMiddleware } from '@clerk/nuxt/server'
 *
 * export default clerkMiddleware()
 * ```
 *
 * @example
 * With custom handler:
 * ```ts
 * import { clerkMiddleware } from '@clerk/nuxt/server'
 *
 * export default clerkMiddleware((event) => {
 *   // Access auth data from the event context
 *   const { auth } = event.context
 *
 *   // Example: Require authentication for all API routes
 *   if (!auth.userId && event.path.startsWith('/api')) {
 *     throw createError({
 *       statusCode: 401,
 *       message: 'Unauthorized'
 *     })
 *   }
 * })
 * ```
 */
export function clerkMiddleware(handler?: Handler) {
  return eventHandler(async event => {
    const clerkRequest = toWebRequest(event);

    const requestState = await clerkClient(event).authenticateRequest(clerkRequest);

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      // Trigger a handshake redirect
      return new Response(null, { status: 307, headers: requestState.headers });
    }

    if (requestState.status === AuthStatus.Handshake) {
      throw createError('Clerk: handshake status without redirect');
    }

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        setResponseHeader(event, key, value);
      });
    }

    const authObject = requestState.toAuth();
    event.context.auth = authObject;
    // Internal serializable state that will be passed to the client
    event.context.__clerk_initial_state = createInitialState(authObject);

    handler?.(event);
  });
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthObject;
  }
}
