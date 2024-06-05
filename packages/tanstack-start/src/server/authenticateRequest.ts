import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInState, SignedOutState } from '@clerk/backend/internal';
import { AuthStatus } from '@clerk/backend/internal';
import { sendWebResponse } from 'vinxi/http';

export async function authenticateRequest(
  request: Request,
  opts: AuthenticateRequestOptions,
): Promise<SignedInState | SignedOutState | void> {
  'use server';
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
  }).authenticateRequest(request, {
    audience,
    authorizedParties,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
  });

  const hasLocationHeader = requestState.headers.get('location');
  console.log('hasLocationHeader', hasLocationHeader);
  if (hasLocationHeader) {
    // triggering a handshake redirect
    throw sendWebResponse(new Response(null, { status: 307, headers: requestState.headers }));
  }

  if (requestState.status === AuthStatus.Handshake) {
    throw new Error('Clerk: unexpected handshake without redirect');
  }

  return requestState;
}
