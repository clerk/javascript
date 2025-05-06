import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import { AuthStatus, constants } from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared/deprecated';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { EventHandler } from 'h3';
import { createError, eventHandler, setResponseHeader } from 'h3';

import { clerkClient } from './clerkClient';
import { createInitialState, toWebRequest } from './utils';

function parseHandlerAndOptions(args: unknown[]) {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [EventHandler | undefined, AuthenticateRequestOptions];
}

interface ClerkMiddleware {
  /**
   * @example
   * export default clerkMiddleware((event) => { ... }, options);
   */
  (handler: EventHandler, options?: AuthenticateRequestOptions): ReturnType<typeof eventHandler>;

  /**
   * @example
   * export default clerkMiddleware(options);
   */
  (options?: AuthenticateRequestOptions): ReturnType<typeof eventHandler>;
}

/**
 * Middleware for Nuxt that handles authentication and authorization with Clerk.
 *
 * @example
 * Basic usage with options:
 * ```ts
 * export default clerkMiddleware({
 *   authorizedParties: ['https://example.com']
 * })
 * ```
 *
 * @example
 * With custom handler:
 * ```ts
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
 *
 * @example
 * With custom handler and options:
 * ```ts
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
 * }, {
 *   authorizedParties: ['https://example.com']
 * })
 * ```
 */
export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]) => {
  const [handler, options] = parseHandlerAndOptions(args);
  return eventHandler(async event => {
    const clerkRequest = toWebRequest(event);

    const requestState = await clerkClient(event).authenticateRequest(clerkRequest, options);

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      handleNetlifyCacheInDevInstance({
        locationHeader,
        requestStateHeaders: requestState.headers,
        publishableKey: requestState.publishableKey,
      });
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
    const authHandler = () => authObject;

    const auth = new Proxy(Object.assign(authHandler, authObject), {
      get(target, prop: string, receiver) {
        deprecated('event.context.auth', 'Use `event.context.auth()` as a function instead.');

        return Reflect.get(target, prop, receiver);
      },
    });

    event.context.auth = auth;
    // Internal serializable state that will be passed to the client
    event.context.__clerk_initial_state = createInitialState(authObject);

    await handler?.(event);
  });
};
