import type { AuthOptions, GetAuthFn } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { getContext } from '@tanstack/react-start/server';

import { errorThrower } from '../utils';
import { clerkHandlerNotConfigured, noFetchFnCtxPassedInGetAuth } from '../utils/errors';

export const getAuth: GetAuthFn<Request, true> = (async (request: Request, opts?: AuthOptions) => {
  if (!request) {
    return errorThrower.throw(noFetchFnCtxPassedInGetAuth);
  }

  const authObjectFn = getContext('auth');

  if (!authObjectFn) {
    return errorThrower.throw(clerkHandlerNotConfigured);
  }

  // We're keeping it a promise for now to minimize breaking changes
  const authObject = await Promise.resolve(authObjectFn({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut }));

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken: opts?.acceptsToken });
}) as GetAuthFn<Request, true>;
