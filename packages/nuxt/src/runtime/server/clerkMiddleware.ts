import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import { AuthStatus, constants, getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { EventHandler } from 'h3';
import { createError, eventHandler, setResponseHeader } from 'h3';

import { canUseKeyless } from '../utils/feature-flags';
import { clerkClient } from './clerkClient';
import { resolveKeysWithKeylessFallback } from './keyless/utils';
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

    // Resolve keyless in development if keys are missing
    let keylessClaimUrl: string | undefined;
    let keylessApiKeysUrl: string | undefined;

    if (canUseKeyless) {
      try {
        // Get runtime config to access configured keys
        // @ts-expect-error: Nitro import. Handled by Nuxt.
        const { useRuntimeConfig } = await import('#imports');
        const runtimeConfig = useRuntimeConfig(event);

        const { publishableKey, secretKey, claimUrl, apiKeysUrl } = await resolveKeysWithKeylessFallback(
          runtimeConfig.public.clerk.publishableKey,
          runtimeConfig.clerk.secretKey,
          event,
        );

        keylessClaimUrl = claimUrl;
        keylessApiKeysUrl = apiKeysUrl;

        // Override runtime config with keyless values if returned
        if (publishableKey) {
          runtimeConfig.public.clerk.publishableKey = publishableKey;
        }
        if (secretKey) {
          runtimeConfig.clerk.secretKey = secretKey;
        }
      } catch {
        // Silently fail - continue without keyless
      }
    }

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

    event.context.auth = authHandler;
    // Internal serializable state that will be passed to the client
    event.context.__clerk_initial_state = createInitialState(authObjectFn());

    // Store keyless mode URLs in separate context property
    if (canUseKeyless && keylessClaimUrl) {
      event.context.__clerk_keyless = {
        claimUrl: keylessClaimUrl,
        apiKeysUrl: keylessApiKeysUrl,
      };
    }

    await handler?.(event);
  });
};
