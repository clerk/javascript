import type { AuthObject } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/types';
import type { unstable_MiddlewareFunction } from 'react-router';
import { unstable_createContext } from 'react-router';

import { clerkClient } from './clerkClient';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions } from './types';
import { patchRequest } from './utils';

export const authFnContext = unstable_createContext<((options?: PendingSessionOptions) => AuthObject) | null>(null);
export const requestStateContext = unstable_createContext<RequestState<any> | null>(null);

export const clerkMiddleware = (options?: ClerkMiddlewareOptions): unstable_MiddlewareFunction<Response> => {
  return async (args, next) => {
    const clerkRequest = createClerkRequest(patchRequest(args.request));
    const loadedOptions = loadOptions(args, options);
    const { audience, authorizedParties } = loadedOptions;
    const { signInUrl, signUpUrl, afterSignInUrl, afterSignUpUrl } = loadedOptions;
    const requestState = await clerkClient(args).authenticateRequest(clerkRequest, {
      audience,
      authorizedParties,
      signInUrl,
      signUpUrl,
      afterSignInUrl,
      afterSignUpUrl,
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

    args.context.set(authFnContext, (options?: PendingSessionOptions) => requestState.toAuth(options));
    args.context.set(requestStateContext, requestState);

    const response = await next();

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
};
