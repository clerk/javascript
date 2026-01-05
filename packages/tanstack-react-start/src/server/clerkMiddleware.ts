import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { AnyRequestMiddleware } from '@tanstack/react-start';
import { createMiddleware, json } from '@tanstack/react-start';

import { canUseKeyless } from '../utils/feature-flags';
import { clerkClient } from './clerkClient';
import { resolveKeysWithKeylessFallback } from './keyless/utils';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions } from './types';
import { getResponseClerkState, patchRequest } from './utils';

export const clerkMiddleware = (options?: ClerkMiddlewareOptions): AnyRequestMiddleware => {
  return createMiddleware().server(async ({ request, next }) => {
    const clerkRequest = createClerkRequest(patchRequest(request));

    // Get keys - either from options, env, or keyless mode
    const {
      publishableKey,
      secretKey,
      claimUrl: keylessClaimUrl,
      apiKeysUrl: keylessApiKeysUrl,
    } = await resolveKeysWithKeylessFallback(options?.publishableKey, options?.secretKey);

    // Load options with resolved keys
    const loadedOptions = loadOptions(clerkRequest, {
      ...options,
      publishableKey,
      secretKey,
    });

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
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw json(null, { status: 307, headers: requestState.headers });
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
