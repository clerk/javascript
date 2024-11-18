import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import { assertHeaderAlgorithm, assertHeaderType } from '../jwt/assertions';
import { decodeJwt, hasValidSignature } from '../jwt/verifyJwt';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';
import type { VerifyTokenOptions } from './verify';

async function verifyHandshakeJwt(token: string, { key }: VerifyJwtOptions): Promise<{ handshake: string[] }> {
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }

  const { header, payload } = decoded;

  // Header verifications
  const { typ, alg } = header;

  assertHeaderType(typ);
  assertHeaderAlgorithm(alg);

  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Error verifying handshake token. ${signatureErrors[0]}`,
    });
  }

  if (!signatureValid) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidSignature,
      message: 'Handshake signature is invalid.',
    });
  }

  return payload as unknown as { handshake: string[] };
}

/**
 * Similar to our verifyToken flow for Clerk-issued JWTs, but this verification flow is for our signed handshake payload.
 * The handshake payload requires fewer verification steps.
 */
export async function verifyHandshakeToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<{ handshake: string[] }> {
  const { secretKey, apiUrl, apiVersion, jwksCacheTtlInMs, jwtKey, skipJwksCache } = options;

  const { data, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }

  const { kid } = data.header;

  let key;

  if (jwtKey) {
    key = loadClerkJWKFromLocal(jwtKey);
  } else if (secretKey) {
    // Fetch JWKS from Backend API using the key
    key = await loadClerkJWKFromRemote({ secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: 'Failed to resolve JWK during handshake verification.',
      reason: TokenVerificationErrorReason.JWKFailedToResolve,
    });
  }

  return await verifyHandshakeJwt(token, {
    key,
  });
}
