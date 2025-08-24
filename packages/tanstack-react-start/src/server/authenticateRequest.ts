import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, RequestState } from '@clerk/backend/internal';

import { patchRequest } from './utils';

export async function authenticateRequest(request: Request, opts: AuthenticateRequestOptions): Promise<RequestState> {
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

  return requestState;
}
