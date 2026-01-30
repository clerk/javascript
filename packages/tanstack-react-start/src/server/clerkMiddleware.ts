import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { AnyRequestMiddleware } from '@tanstack/react-start';
import { createMiddleware } from '@tanstack/react-start';

import { canUseKeyless } from '../utils/feature-flags';
import { clerkClient } from './clerkClient';
import { resolveKeysWithKeylessFallback } from './keyless/utils';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions, ClerkMiddlewareOptionsCallback } from './types';
import { getResponseClerkState, patchRequest } from './utils';

export const clerkMiddleware = (
  options?: ClerkMiddlewareOptions | ClerkMiddlewareOptionsCallback,
): AnyRequestMiddleware => {
  return createMiddleware().server(async ({ request, next }) => {
    const clerkRequest = createClerkRequest(patchRequest(request));

    // Resolve options: if function, call it with context object; otherwise use as-is
    const resolvedOptions = typeof options === 'function' ? await options({ url: clerkRequest.clerkUrl }) : options;

    // Load options with resolved keys
    const loadedOptions = loadOptions(clerkRequest, {
      ...resolvedOptions,
      publishableKey: resolvedOptions?.publishableKey,
      secretKey: resolvedOptions?.secretKey,
    });

    // Get keys - either from options, env, or keyless mode
    const {
      publishableKey,
      secretKey,
      claimUrl: keylessClaimUrl,
      apiKeysUrl: keylessApiKeysUrl,
    } = await resolveKeysWithKeylessFallback(loadedOptions.publishableKey, loadedOptions.secretKey);

    if (publishableKey) {
      loadedOptions.publishableKey = publishableKey;
    }
    if (secretKey) {
      loadedOptions.secretKey = secretKey;
    }

    const requestState = await clerkClient().authenticateRequest(clerkRequest, {
      ...loadedOptions,
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
      throw new Error('Clerk: handshake status without redirect');
    }

    const clerkInitialState = getResponseClerkState(requestState as RequestState, loadedOptions);

    // Include keyless mode URLs if applicable
    if (canUseKeyless && keylessClaimUrl) {
      (clerkInitialState as Record<string, unknown>).__internal_clerk_state = {
        ...((clerkInitialState as Record<string, unknown>).__internal_clerk_state as Record<string, unknown>),
        __keylessClaimUrl: keylessClaimUrl,
        __keylessApiKeysUrl: keylessApiKeysUrl,
      };
    }

    const result = await next({
      context: {
        clerkInitialState,
        auth: (opts?: PendingSessionOptions) => requestState.toAuth(opts),
      },
    });

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        result.response.headers.append(key, value);
      });
    }

    return result;
  });
};
