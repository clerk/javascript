import type { Jwt, JwtPayload } from '@clerk/types';

// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../../runtime';
import { base64url } from '../../util/rfc4648';
import { deprecated } from '../../util/shared';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { IssuerResolver } from './assertions';
import {
  algToHash,
  assertActivationClaim,
  assertAudienceClaim,
  assertAuthorizedPartiesClaim,
  assertExpirationClaim,
  assertHeaderAlgorithm,
  assertHeaderType,
  assertIssuedAtClaim,
  assertIssuerClaim,
  assertSubClaim,
} from './assertions';

const DEFAULT_CLOCK_SKEW_IN_SECONDS = 5 * 1000;

const RSA_ALGORITHM_NAME = 'RSASSA-PKCS1-v1_5';
const EC_ALGORITHM_NAME = 'ECDSA';

const jwksAlgToCryptoAlg: Record<string, string> = {
  RS256: RSA_ALGORITHM_NAME,
  RS384: RSA_ALGORITHM_NAME,
  RS512: RSA_ALGORITHM_NAME,
  ES256: EC_ALGORITHM_NAME,
  ES384: EC_ALGORITHM_NAME,
  ES512: EC_ALGORITHM_NAME,
};

export async function hasValidSignature(jwt: Jwt, jwk: JsonWebKey) {
  const { header, signature, raw } = jwt;
  const encoder = new TextEncoder();
  const data = encoder.encode([raw.header, raw.payload].join('.'));

  const cryptoKey = await runtime.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: jwksAlgToCryptoAlg[header.alg],
      hash: algToHash[header.alg],
    },
    false,
    ['verify'],
  );

  return runtime.crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, data);
}

export function decodeJwt(token: string): Jwt {
  const tokenParts = (token || '').toString().split('.');
  if (tokenParts.length !== 3) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalid,
      message: `Invalid JWT form. A JWT consists of three parts separated by dots.`,
    });
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

  return {
    header,
    payload,
    signature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
      text: token,
    },
  };
}

export type VerifyJwtOptions = {
  audience?: string | string[];
  authorizedParties?: string[];
  /**
   * @deprecated This option incorrectly accepts milliseconds instead of seconds and has been deprecated. Use clockSkewInMs instead.
   */
  clockSkewInSeconds?: number;
  clockSkewInMs?: number;
  issuer: IssuerResolver | string | null;
  key: JsonWebKey;
};

// TODO: Revise the return types. Maybe it's better to throw an error instead of return an object with a reason
export async function verifyJwt(
  token: string,
  { audience, authorizedParties, clockSkewInSeconds, clockSkewInMs, issuer, key }: VerifyJwtOptions,
): Promise<JwtPayload> {
  if (clockSkewInSeconds) {
    deprecated('clockSkewInSeconds', 'Use `clockSkewInMs` instead.');
  }

  const clockSkew = clockSkewInMs || clockSkewInSeconds || DEFAULT_CLOCK_SKEW_IN_SECONDS;

  const decoded = decodeJwt(token);

  const { header, payload } = decoded;

  // Header verifications
  const { typ, alg } = header;

  assertHeaderType(typ);
  assertHeaderAlgorithm(alg);

  // Payload verifications
  const { azp, sub, aud, iss, iat, exp, nbf } = payload;

  assertSubClaim(sub);
  assertAudienceClaim([aud], [audience]);
  assertAuthorizedPartiesClaim(azp, authorizedParties);
  assertIssuerClaim(iss, issuer);
  assertExpirationClaim(exp, clockSkew);
  assertActivationClaim(nbf, clockSkew);
  assertIssuedAtClaim(iat, clockSkew);

  let signatureValid: boolean;

  try {
    signatureValid = await hasValidSignature(decoded, key);
  } catch (err) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Error verifying JWT signature. ${err}`,
    });
  }

  if (!signatureValid) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidSignature,
      message: 'JWT signature is invalid.',
    });
  }

  return payload;
}
