import type { AuthenticateRequestOptions, GetAuthFn } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';

import { errorThrower } from '../utils';
import { noFetchFnCtxPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';

type GetAuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] } & Pick<LoaderOptions, 'secretKey'>;

export const getAuth: GetAuthFn<Request, true> = (async (request: Request, opts?: GetAuthOptions) => {
  if (!request) {
    return errorThrower.throw(noFetchFnCtxPassedInGetAuth);
  }

  const { acceptsToken, ...restOptions } = opts || {};

  const loadedOptions = loadOptions(request, restOptions);

  const requestState = await authenticateRequest(request, {
    ...loadedOptions,
    acceptsToken: 'any',
  });

  const authObject = requestState.toAuth();

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken });
}) as GetAuthFn<Request, true>;
