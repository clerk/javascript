import type { AuthenticateRequestOptions, GetAuthFn } from '@clerk/backend/internal';
import {
  isTokenTypeAccepted,
  signedOutAuthObject,
  TokenType,
  unauthenticatedMachineObject,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';

import { errorThrower } from '../utils';
import { noFetchFnCtxPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] } & Pick<
    LoaderOptions,
    'secretKey'
  >;

export const getAuth: GetAuthFn<Request, true> = async (request: Request, opts?: GetAuthOptions) => {
  if (!request) {
    return errorThrower.throw(noFetchFnCtxPassedInGetAuth);
  }

  const { acceptsToken = TokenType.SessionToken, ...restOptions } = opts || {};

  const loadedOptions = loadOptions(request, restOptions);

  const requestState = await authenticateRequest(request, {
    ...loadedOptions,
    acceptsToken: 'any',
  });

  const authObject = requestState.toAuth({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut });

  if (acceptsToken === 'any') {
    return authObject;
  }

  if (!isTokenTypeAccepted(authObject.tokenType, acceptsToken)) {
    if (authObject.tokenType === TokenType.SessionToken) {
      return signedOutAuthObject(authObject.debug);
    }
    return unauthenticatedMachineObject(authObject.tokenType, authObject.debug);
  }

  return authObject;
};
