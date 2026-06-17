import {
  type AuthenticateRequestOptions,
  type GetAuthFn,
  getAuthObjectForAcceptedToken,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { LoaderFunctionArgs } from 'react-router';

import { noLoaderArgsPassedInGetAuth } from '../utils/errors';
import { authenticateFromRequest } from './clerkMiddleware';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<LoaderFunctionArgs, true> = (async (
  args: LoaderFunctionArgs,
  opts?: GetAuthOptions,
) => {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }

  const { acceptsToken, treatPendingAsSignedOut } = opts || {};

  // Re-derive the current request's auth from `args.request` rather than reading
  // a cached value off the React Router context. Identity is a pure function of
  // this request's cookies/headers, so a context shared across requests can never
  // return another user. clerkMiddleware (required) already ran the handshake and
  // warmed the JWKS cache, so this verification is networkless.
  const requestState = await authenticateFromRequest(args, 'any');

  return getAuthObjectForAcceptedToken({
    authObject: requestState.toAuth({ treatPendingAsSignedOut }),
    acceptsToken,
  });
}) as GetAuthFn<LoaderFunctionArgs, true>;
