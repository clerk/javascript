import {
  type AuthenticateRequestOptions,
  type GetAuthFn,
  getAuthObjectForAcceptedToken,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { LoaderFunctionArgs } from 'react-router';

import { noLoaderArgsPassedInGetAuth } from '../utils/errors';
import { resolveRequestState } from './clerkMiddleware';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<LoaderFunctionArgs, true> = (async (
  args: LoaderFunctionArgs,
  opts?: GetAuthOptions,
) => {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }

  const { acceptsToken, treatPendingAsSignedOut } = opts || {};

  // Resolve auth for this request: reuse what the middleware resolved (keyed by
  // Request, so a shared context can't return another user), re-deriving only on
  // a Request-instance miss.
  const requestState = await resolveRequestState(args);

  return getAuthObjectForAcceptedToken({
    authObject: requestState.toAuth({ treatPendingAsSignedOut }),
    acceptsToken,
  });
}) as GetAuthFn<LoaderFunctionArgs, true>;
