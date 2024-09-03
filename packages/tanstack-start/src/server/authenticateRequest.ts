import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInState, SignedOutState } from '@clerk/backend/internal';
import { AuthStatus } from '@clerk/backend/internal';

import { errorThrower } from '../utils';
import { patchRequest } from './utils';

export async function authenticateRequest(
  request: Request,
  opts: AuthenticateRequestOptions,
): Promise<SignedInState | SignedOutState> {
  const { audience, authorizedParties } = opts;

  const { apiUrl, secretKey, jwtKey, proxyUrl, isSatellite, domain, publishableKey } = opts;
  const { signInUrl, signUpUrl, afterSignInUrl, afterSignUpUrl } = opts;

  const requestState = await createClerkClient({
    apiUrl,
    secretKey,
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
  });

  const hasLocationHeader = requestState.headers.get('location');
  if (hasLocationHeader) {
    // triggering a handshake redirect
    throw new Response(null, { status: 307, headers: requestState.headers });
  }

  if (requestState.status === AuthStatus.Handshake) {
    throw errorThrower.throw('Clerk: unexpected handshake without redirect');
  }

  return requestState;
}
