import type { Jwt, JwtPayload } from '@clerk/types';

// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../../runtime';
import { base64url } from '../../util/rfc4648';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';

type IssuerResolver = string | ((iss: string) => boolean);

const DEFAULT_CLOCK_SKEW_IN_SECONDS = 2 * 1000;

const algToHash: Record<string, string> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512',
  ES256: 'SHA-256',
  ES384: 'SHA-384',
  ES512: 'SHA-512',
};

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

const algs = Object.keys(algToHash);

const isArrayString = (s: unknown): s is string[] => {
  return Array.isArray(s) && s.length > 0 && s.every(a => typeof a === 'string');
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
  clockSkewInSeconds?: number;
  issuer: IssuerResolver | string | null;
  key: JsonWebKey;
};

// TODO: Revise the return types. Maybe it's better to throw an error instead of return an object with a reason
export async function verifyJwt(
  token: string,
  { audience, authorizedParties, clockSkewInSeconds = DEFAULT_CLOCK_SKEW_IN_SECONDS, issuer, key }: VerifyJwtOptions,
): Promise<JwtPayload> {
  const decoded = decodeJwt(token);

  const { header, payload } = decoded;

  // Header verifications
  const { typ, alg } = header;

  // Verify type
  if (typeof typ !== 'undefined' && typ !== 'JWT') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalid,
      message: `Invalid JWT type ${JSON.stringify(typ)}. Expected "JWT".`,
    });
  }

  // Verify algorithm
  if (!algToHash[alg]) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalidAlgorithm,
      message: `Invalid JWT algorithm ${JSON.stringify(alg)}. Supported: ${algs}.`,
    });
  }

  // Payload verifications
  const { azp, sub, aud, iss, iat, exp, nbf } = payload;

  // Verify subject claim (sub)
  if (typeof sub !== 'string') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(sub)}.`,
    });
  }

  // Verify audience claim (aud)
  const audiences = [audience].flat().filter(a => !!a);
  const shouldVerifyAudience = audiences.length > 0 && aud;

  if (!shouldVerifyAudience) {
    // Avoid verifying aud claim & audience param
    // Notice: Clerk JWTs use AZP claim instead of Audience
    //
    // return {
    //   valid: false,
    //   reason: `Invalid JWT audience claim (aud) ${JSON.stringify(
    //     aud,
    //   )}. Expected a string or a non-empty array of strings.`,
    // };
  } else if (typeof aud === 'string') {
    if (!audiences.includes(aud)) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audiences,
        )}".`,
      });
    }
  } else if (isArrayString(aud)) {
    if (!aud.some(a => audiences.includes(a))) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim array (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audiences,
        )}".`,
      });
    }
  }

  // Verify authorized parties claim (azp)
  if (azp && authorizedParties && authorizedParties.length > 0 && !authorizedParties.includes(azp)) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
      message: `Invalid JWT Authorized party claim (azp) ${JSON.stringify(azp)}. Expected "${authorizedParties}".`,
    });
  }

  // Verify issuer claim (iss)
  if (typeof issuer === 'function' && !issuer(iss)) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidIssuer,
      message: 'Failed JWT issuer resolver. Make sure that the resolver returns a truthy value.',
    });
  } else if (typeof issuer === 'string' && iss && iss !== issuer) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidIssuer,
      message: `Invalid JWT issuer claim (iss) ${JSON.stringify(decoded.payload.iss)}. Expected "${issuer}".`,
    });
  }

  // Verify expiration claim (exp)
  if (typeof exp !== 'number') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT expiry date claim (exp) ${JSON.stringify(exp)}. Expected number.`,
    });
  }
  const currentDate = new Date(Date.now());
  const expiryDate = new Date(0);
  expiryDate.setUTCSeconds(exp);
  const expired = expiryDate.getTime() <= currentDate.getTime() - clockSkewInSeconds;
  if (expired) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenExpired,
      message: `JWT is expired. Expiry date: ${expiryDate}, Current date: ${currentDate}.`,
    });
  }

  // Verify activation claim (nbf)
  if (nbf !== undefined) {
    if (typeof nbf !== 'number') {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT not before date claim (nbf) ${JSON.stringify(nbf)}. Expected number.`,
      });
    }
    const notBeforeDate = new Date(0);
    notBeforeDate.setUTCSeconds(nbf);
    const early = notBeforeDate.getTime() > currentDate.getTime() + clockSkewInSeconds;
    if (early) {
      throw new TokenVerificationError({
        reason: TokenVerificationErrorReason.TokenNotActiveYet,
        message: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${notBeforeDate}; Current date: ${currentDate};`,
      });
    }
  }

  // Verify issued at claim (iat)
  if (iat !== undefined) {
    if (typeof iat !== 'number') {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT issued at date claim (iat) ${JSON.stringify(iat)}. Expected number.`,
      });
    }
    const issuedAtDate = new Date(0);
    issuedAtDate.setUTCSeconds(iat);
    const postIssued = issuedAtDate.getTime() > currentDate.getTime() + clockSkewInSeconds;
    if (postIssued) {
      throw new TokenVerificationError({
        reason: TokenVerificationErrorReason.TokenNotActiveYet,
        message: `JWT issued at date claim (iat) is in the future. Issued at date: ${issuedAtDate}; Current date: ${currentDate};`,
      });
    }
  }

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
