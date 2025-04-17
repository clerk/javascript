import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInState, SignedOutState } from '@clerk/backend/internal';
import { AuthStatus, constants } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';

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

  const locationHeader = requestState.headers.get(constants.Headers.Location);
  if (locationHeader) {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    console.log('is on netlify process.env.NETLIFY', process.env.NETLIFY);
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    console.log('is on netlify import.meta.env.NETLIFY', import.meta.env.NETLIFY);
    handleNetlifyCacheInDevInstance({
      locationHeader,
      requestStateHeaders: requestState.headers,
      publishableKey: requestState.publishableKey,
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      netlifyEnv: import.meta.env.NETLIFY,
    });
    // triggering a handshake redirect
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(null, { status: 307, headers: requestState.headers });
  }

  if (requestState.status === AuthStatus.Handshake) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: unexpected handshake without redirect');
  }

  return requestState;
}
