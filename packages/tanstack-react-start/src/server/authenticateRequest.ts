import { createClerkClient } from '@clerk/backend';
import type { AuthenticatedState, AuthenticateRequestOptions, UnauthenticatedState } from '@clerk/backend/internal';
import { AuthStatus, constants } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';

import { errorThrower } from '../utils';
import { ClerkHandshakeRedirect } from './errors';
import { patchRequest } from './utils';

export async function authenticateRequest(
  request: Request,
  opts: AuthenticateRequestOptions,
): Promise<AuthenticatedState | UnauthenticatedState> {
  const { audience, authorizedParties } = opts;

  const { apiUrl, secretKey, jwtKey, proxyUrl, isSatellite, domain, publishableKey, acceptsToken, machineSecretKey } =
    opts;
  const { signInUrl, signUpUrl, afterSignInUrl, afterSignUpUrl } = opts;

  const requestState = await createClerkClient({
    apiUrl,
    secretKey,
    machineSecretKey,
    jwtKey,
    proxyUrl,
    isSatellite,
    domain,
    publishableKey,
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  }).authenticateRequest(patchRequest(request), {
    audience,
    authorizedParties,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    acceptsToken,
  });

  const locationHeader = requestState.headers.get(constants.Headers.Location);
  if (locationHeader) {
    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders: requestState.headers,
      publishableKey: requestState.publishableKey,
    });

    // triggering a handshake redirect
    throw new ClerkHandshakeRedirect(307, requestState.headers);
  }

  if (requestState.status === AuthStatus.Handshake) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: unexpected handshake without redirect');
  }

  return requestState;
}
