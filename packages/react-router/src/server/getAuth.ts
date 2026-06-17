import {
  type AuthenticateRequestOptions,
  type GetAuthFn,
  getAuthObjectForAcceptedToken,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { LoaderFunctionArgs } from 'react-router';

import { IsOptIntoMiddleware } from '../server/utils';
import { noLoaderArgsPassedInGetAuth } from '../utils/errors';
import { authFnContext } from './clerkMiddleware';
import { requestAuthStorage } from './requestAuthStorage';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<LoaderFunctionArgs, true> = (async (
  args: LoaderFunctionArgs,
  opts?: GetAuthOptions,
) => {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }

  const { acceptsToken, treatPendingAsSignedOut } = opts || {};

  // Prefer the request-scoped store (immune to a shared RouterContextProvider);
  // fall back to the RR context slot for runtimes without async storage or calls
  // made outside the middleware's async scope.
  const scopedAuthFn = requestAuthStorage.getStore()?.authFn;
  const authObjectFn = scopedAuthFn ?? (IsOptIntoMiddleware(args.context) && args.context.get(authFnContext));
  if (!authObjectFn) {
    throw new Error(
      'Clerk: clerkMiddleware() not detected. Make sure you have installed the clerkMiddleware in your root route.',
    );
  }

  return getAuthObjectForAcceptedToken({
    authObject: authObjectFn({ treatPendingAsSignedOut }),
    acceptsToken,
  });
}) as GetAuthFn<LoaderFunctionArgs, true>;
