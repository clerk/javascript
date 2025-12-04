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
import { legacyAuthenticateRequest } from './legacyAuthenticateRequest';
import { loadOptions } from './loadOptions';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<LoaderFunctionArgs, true> = (async (
  args: LoaderFunctionArgs,
  opts?: GetAuthOptions,
) => {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }

  const { acceptsToken, treatPendingAsSignedOut, ...restOptions } = opts || {};

  // If the middleware is installed, use the auth function from the context
  const authObjectFn = IsOptIntoMiddleware(args.context) && args.context.get(authFnContext);
  if (authObjectFn) {
    return getAuthObjectForAcceptedToken({
      authObject: authObjectFn({ treatPendingAsSignedOut }),
      acceptsToken,
    });
  }

  // Fallback to the legacy authenticateRequest if the middleware is not installed
  const loadedOptions = loadOptions(args, restOptions);
  const requestState = await legacyAuthenticateRequest(args, {
    ...loadedOptions,
    acceptsToken: 'any',
  });

  const authObject = requestState.toAuth({ treatPendingAsSignedOut });

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken });
}) as GetAuthFn<LoaderFunctionArgs, true>;
