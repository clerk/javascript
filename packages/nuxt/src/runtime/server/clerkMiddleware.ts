import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import { AuthStatus, constants, getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared/deprecated';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { EventHandler } from 'h3';
import { createError, eventHandler, setResponseHeader } from 'h3';

import { clerkClient } from './clerkClient';
import type { AuthFn, AuthOptions } from './types';
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

    const requestState = await clerkClient(event).authenticateRequest(clerkRequest, {
      ...options,
      acceptsToken: 'any',
    });

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

    const authObjectFn = (opts?: PendingSessionOptions) => requestState.toAuth(opts);
    const authHandler: AuthFn = ((options?: AuthOptions) => {
      return getAuthObjectForAcceptedToken({ authObject: authObjectFn(options), acceptsToken: options?.acceptsToken });
    }) as AuthFn;

    const auth = new Proxy(authHandler, {
      get(target, prop, receiver) {
        deprecated('event.context.auth', 'Use `event.context.auth()` as a function instead.');
        // If the property exists on the function, return it
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        // Otherwise, get it from the authObject
        return authObjectFn()?.[prop as keyof typeof authObjectFn];
      },
    });

    event.context.auth = auth;
    // Internal serializable state that will be passed to the client
    event.context.__clerk_initial_state = createInitialState(authObjectFn());

    await handler?.(event);
  });
};
