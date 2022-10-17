import type { ClerkJWTClaims } from '@clerk/types';

import { type VerifyJwtOptions, decodeJwt, verifyJwt } from './jwt';
import { type LoadKeyOptions, loadKey } from './keys';

/**
 *
 */
export type VerifySessionTokenOptions = Pick<VerifyJwtOptions, 'authorizedParties' | 'clockSkewInSeconds'> &
  Pick<LoadKeyOptions, 'jwksTTL'>;

export async function verifySessionToken(token: string, options: VerifySessionTokenOptions): Promise<ClerkJWTClaims> {
  const { authorizedParties, clockSkewInSeconds, jwksTTL } = options;

  const { header, claims } = decodeJwt(token);
  const { iss: issuer } = claims;
  const { kid } = header;

  const key = await loadKey({
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    localKey: process.env.CLERK_JWT_KEY,
    issuer,
    kid,
    jwksTTL,
  });

  return verifyJwt(token, {
    authorizedParties,
    clockSkewInSeconds,
    key,
  });
}
