import type { SessionAuthObject } from '@clerk/backend';
import type { AuthOptions, GetAuthFnNoRequest } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { getGlobalStartContext } from '@tanstack/react-start';

import { errorThrower } from '../utils';
import { clerkMiddlewareNotConfigured } from '../utils/errors';

export const auth: GetAuthFnNoRequest<SessionAuthObject, true> = (async (opts?: AuthOptions) => {
  // @ts-expect-error: Untyped internal Clerk start context
  const authObjectFn = getGlobalStartContext().auth;

  if (!authObjectFn) {
    return errorThrower.throw(clerkMiddlewareNotConfigured);
  }

  // We're keeping it a promise for now for future changes
  const authObject = await Promise.resolve(authObjectFn({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut }));

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken: opts?.acceptsToken });
}) as GetAuthFnNoRequest<SessionAuthObject, true>;
