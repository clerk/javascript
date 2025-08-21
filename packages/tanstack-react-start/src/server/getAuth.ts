import type { AuthenticateRequestOptions, GetAuthFn } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { getContext } from '@tanstack/react-start/server';

import { errorThrower } from '../utils';
import { clerkHandlerNotConfigured, noFetchFnCtxPassedInGetAuth } from '../utils/errors';

type GetAuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<Request> = ((request: Request, opts?: GetAuthOptions) => {
  if (!request) {
    return errorThrower.throw(noFetchFnCtxPassedInGetAuth);
  }

  const authObjectFn = getContext('auth');

  if (!authObjectFn) {
    return errorThrower.throw(clerkHandlerNotConfigured);
  }

  return getAuthObjectForAcceptedToken({ authObject: authObjectFn(), acceptsToken: opts?.acceptsToken });
}) as GetAuthFn<Request>;
