import type { Jwt, JwtPayload } from '@clerk/types';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import { runtime } from '../runtime';
import { base64url } from '../util/rfc4648';
import { getCryptoAlgorithm } from './algorithms';
import {
  assertActivationClaim,
  assertAudienceClaim,
  assertAuthorizedPartiesClaim,
  assertExpirationClaim,
  assertHeaderAlgorithm,
  assertHeaderType,
  assertIssuedAtClaim,
  assertSubClaim,
} from './assertions';
import { importKey } from './cryptoKeys';
import type { JwtReturnType } from './types';

const DEFAULT_CLOCK_SKEW_IN_MS = 5 * 1000;

export async function hasValidSignature(jwt: Jwt, key: JsonWebKey | string): Promise<JwtReturnType<boolean, Error>> {
  const { header, signature, raw } = jwt;
  const encoder = new TextEncoder();
  const data = encoder.encode([raw.header, raw.payload].join('.'));
  const algorithm = getCryptoAlgorithm(header.alg);

  try {
    const cryptoKey = await importKey(key, algorithm, 'verify');

    const verified = await runtime.crypto.subtle.verify(algorithm.name, cryptoKey, signature, data);
    return { data: verified };
  } catch (error) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: (error as Error)?.message,
        }),
      ],
    };
  }
}

export function decodeJwt(token: string): JwtReturnType<Jwt, TokenVerificationError> {
  const tokenParts = (token || '').toString().split('.');
  if (tokenParts.length !== 3) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: `Invalid JWT form. A JWT consists of three parts separated by dots.`,
        }),
      ],
    };
  }

  const [rawHeader, rawPayload, rawSignature] = tokenParts;

  const decoder = new TextDecoder();

  // To verify a JWS with SubtleCrypto you need to be careful to encode and decode
  // the data properly between binary and base64url representation. Unfortunately
  // the standard implementation in the V8 of btoa() and atob() are difficult to
  // work with as they use "a Unicode string containing only characters in the
  // range U+0000 to U+00FF, each representing a binary byte with values 0x00 to
  // 0xFF respectively" as the representation of binary data.

  // A better solution to represent binary data in Javascript is to use ES6 TypedArray
  // and use a Javascript library to convert them to base64url that honors RFC 4648.

  // Side note: The difference between base64 and base64url is the characters selected
  // for value 62 and 63 in the standard, base64 encode them to + and / while base64url
  // encode - and _.

  // More info at https://stackoverflow.com/questions/54062583/how-to-verify-a-signed-jwt-with-subtlecrypto-of-the-web-crypto-API
  const header = JSON.parse(decoder.decode(base64url.parse(rawHeader, { loose: true })));
  const payload = JSON.parse(decoder.decode(base64url.parse(rawPayload, { loose: true })));

  const signature = base64url.parse(rawSignature, { loose: true });

  const data = {
    header,
    payload,
    signature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
      text: token,
    },
  } satisfies Jwt;

  return { data };
}

/**
 * @inline
 */
export type VerifyJwtOptions = {
  /**
   * A string or list of [audiences](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3). If passed, it is checked against the `aud` claim in the token.
   */
  audience?: string | string[];
  /**
   * An allowlist of origins to verify against, to protect your application from the subdomain cookie leaking attack.
   * @example
   * ```ts
   * ['http://localhost:3000', 'https://example.com']
   * ```
   */
  authorizedParties?: string[];
  /**
   * Specifies the allowed time difference (in milliseconds) between the Clerk server (which generates the token) and the clock of the user's application server when validating a token.
   * @default 5000
   */
  clockSkewInMs?: number;
  /**
   * @internal
   */
  key: JsonWebKey | string;
};

export async function verifyJwt(
  token: string,
  options: VerifyJwtOptions,
): Promise<JwtReturnType<JwtPayload, TokenVerificationError>> {
  const { audience, authorizedParties, clockSkewInMs, key } = options;
  const clockSkew = clockSkewInMs || DEFAULT_CLOCK_SKEW_IN_MS;

  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }

  const { header, payload } = decoded;
  try {
    // Header verifications
    const { typ, alg } = header;

    assertHeaderType(typ);
    assertHeaderAlgorithm(alg);

    // Payload verifications
    const { azp, sub, aud, iat, exp, nbf } = payload;

    assertSubClaim(sub);
    assertAudienceClaim([aud], [audience]);
    assertAuthorizedPartiesClaim(azp, authorizedParties);
    assertExpirationClaim(exp, clockSkew);
    assertActivationClaim(nbf, clockSkew);
    assertIssuedAtClaim(iat, clockSkew);
  } catch (err) {
    return { errors: [err as TokenVerificationError] };
  }

  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    return {
      errors: [
        new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Error verifying JWT signature. ${signatureErrors[0]}`,
        }),
      ],
    };
  }

  if (!signatureValid) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: 'JWT signature is invalid.',
        }),
      ],
    };
  }

  return { data: payload };
}
