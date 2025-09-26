import type { AuthenticateRequestOptions, GetAuthFn } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import { getGlobalStartContext } from '@tanstack/react-start';

import { errorThrower } from '../utils';
import { clerkMiddlewareNotConfigured, noFetchFnCtxPassedInGetAuth } from '../utils/errors';

type GetAuthOptions = PendingSessionOptions & Pick<AuthenticateRequestOptions, 'acceptsToken'>;

export const getAuth: GetAuthFn<Request, true> = (async (request: Request, opts?: GetAuthOptions) => {
  if (!request) {
    return errorThrower.throw(noFetchFnCtxPassedInGetAuth);
  }

  // @ts-expect-error: Untyped internal Clerk start context
  const authObjectFn = getGlobalStartContext().auth;

  if (!authObjectFn) {
    return errorThrower.throw(clerkMiddlewareNotConfigured);
  }

  // We're keeping it a promise for now for future changes
  const authObject = await Promise.resolve(authObjectFn({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut }));

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken: opts?.acceptsToken });
}) as GetAuthFn<Request, true>;
