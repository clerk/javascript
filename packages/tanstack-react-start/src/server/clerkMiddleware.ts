import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { AnyRequestMiddleware } from '@tanstack/react-start';
import { createMiddleware, json } from '@tanstack/react-start';

import { clerkClient } from './clerkClient';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions, ClerkMiddlewareOptionsCallback } from './types';
import { getResponseClerkState, patchRequest } from './utils';

export const clerkMiddleware = (
  options?: ClerkMiddlewareOptions | ClerkMiddlewareOptionsCallback,
): AnyRequestMiddleware => {
  return createMiddleware().server(async args => {
    const clerkRequest = createClerkRequest(patchRequest(args.request));

    // Resolve options: if function, call it with context object; otherwise use as-is
    const resolvedOptions = typeof options === 'function' ? await options({ url: clerkRequest.clerkUrl }) : options;

    const loadedOptions = loadOptions(clerkRequest, resolvedOptions);

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

    const result = await args.next({
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
