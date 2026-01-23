import type { AuthenticateRequestOptions, SignedInState, SignedOutState } from '@clerk/backend/internal';
import { AuthStatus, constants } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { LoaderFunctionArgs } from 'react-router';

import { clerkClient } from './clerkClient';
import { patchRequest } from './utils';

export async function legacyAuthenticateRequest(
  args: LoaderFunctionArgs,
  opts: AuthenticateRequestOptions,
): Promise<SignedInState | SignedOutState> {
  const { request } = args;
  const { audience, authorizedParties } = opts;

  const { apiUrl, secretKey, jwtKey, proxyUrl, multiDomain, publishableKey, machineSecretKey } = opts;
  const { signInUrl, signUpUrl } = opts;

  const requestState = await clerkClient(args).authenticateRequest(patchRequest(request), {
    apiUrl,
    secretKey,
    jwtKey,
    proxyUrl,
    multiDomain,
    publishableKey,
    machineSecretKey,
    audience,
    authorizedParties,
    signInUrl,
    signUpUrl,
  });

  const locationHeader = requestState.headers.get(constants.Headers.Location);
  if (locationHeader) {
    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders: requestState.headers,
      publishableKey: requestState.publishableKey,
    });
    // triggering a handshake redirect
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(null, { status: 307, headers: requestState.headers });
  }

  if (requestState.status === AuthStatus.Handshake) {
    throw new Error('Clerk: unexpected handshake without redirect');
  }

  return requestState;
}
