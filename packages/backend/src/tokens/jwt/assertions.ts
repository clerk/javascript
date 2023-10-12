import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import { algs } from './algorithms';

export type IssuerResolver = string | ((iss: string) => boolean);

const isArrayString = (s: unknown): s is string[] => {
  return Array.isArray(s) && s.length > 0 && s.every(a => typeof a === 'string');
};

export const assertAudienceClaim = (aud?: unknown, audience?: unknown) => {
  const audienceList = [audience].flat().filter(a => !!a);
  const audList = [aud].flat().filter(a => !!a);
  const shouldVerifyAudience = audienceList.length > 0 && audList.length > 0;

  if (!shouldVerifyAudience) {
    // Notice: Clerk JWTs use AZP claim instead of Audience
    //
    // return {
    //   valid: false,
    //   reason: `Invalid JWT audience claim (aud) ${JSON.stringify(
    //     aud,
    //   )}. Expected a string or a non-empty array of strings.`,
    // };
    return;
  }

  if (typeof aud === 'string') {
    if (!audienceList.includes(aud)) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audienceList,
        )}".`,
      });
    }
  } else if (isArrayString(aud)) {
    if (!aud.some(a => audienceList.includes(a))) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim array (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audienceList,
        )}".`,
      });
    }
  }
};

export const assertHeaderType = (typ?: unknown) => {
  if (typeof typ === 'undefined') {
    return;
  }

  if (typ !== 'JWT') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalid,
      message: `Invalid JWT type ${JSON.stringify(typ)}. Expected "JWT".`,
    });
  }
};

export const assertHeaderAlgorithm = (alg: string) => {
  if (!algs.includes(alg)) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalidAlgorithm,
      message: `Invalid JWT algorithm ${JSON.stringify(alg)}. Supported: ${algs}.`,
    });
  }
};

export const assertSubClaim = (sub?: string) => {
  if (typeof sub !== 'string') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(sub)}.`,
    });
  }
};

export const assertAuthorizedPartiesClaim = (azp?: string, authorizedParties?: string[]) => {
  if (!azp || !authorizedParties || authorizedParties.length === 0) {
    return;
  }

  if (!authorizedParties.includes(azp)) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
      message: `Invalid JWT Authorized party claim (azp) ${JSON.stringify(azp)}. Expected "${authorizedParties}".`,
    });
  }
};

export const assertIssuerClaim = (iss: string, issuer: IssuerResolver | null) => {
  if (typeof issuer === 'function' && !issuer(iss)) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidIssuer,
      message: 'Failed JWT issuer resolver. Make sure that the resolver returns a truthy value.',
    });
  } else if (typeof issuer === 'string' && iss && iss !== issuer) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidIssuer,
      message: `Invalid JWT issuer claim (iss) ${JSON.stringify(iss)}. Expected "${issuer}".`,
    });
  }
};

export const assertExpirationClaim = (exp: number, clockSkewInMs: number) => {
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

  const expired = expiryDate.getTime() <= currentDate.getTime() - clockSkewInMs;
  if (expired) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenExpired,
      message: `JWT is expired. Expiry date: ${expiryDate.toUTCString()}, Current date: ${currentDate.toUTCString()}.`,
    });
  }
};

export const assertActivationClaim = (nbf: number | undefined, clockSkewInMs: number) => {
  if (typeof nbf === 'undefined') {
    return;
  }

  if (typeof nbf !== 'number') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT not before date claim (nbf) ${JSON.stringify(nbf)}. Expected number.`,
    });
  }

  const currentDate = new Date(Date.now());
  const notBeforeDate = new Date(0);
  notBeforeDate.setUTCSeconds(nbf);

  const early = notBeforeDate.getTime() > currentDate.getTime() + clockSkewInMs;
  if (early) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenNotActiveYet,
      message: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${notBeforeDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`,
    });
  }
};

export const assertIssuedAtClaim = (iat: number | undefined, clockSkewInMs: number) => {
  if (typeof iat === 'undefined') {
    return;
  }

  if (typeof iat !== 'number') {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT issued at date claim (iat) ${JSON.stringify(iat)}. Expected number.`,
    });
  }

  const currentDate = new Date(Date.now());
  const issuedAtDate = new Date(0);
  issuedAtDate.setUTCSeconds(iat);

  const postIssued = issuedAtDate.getTime() > currentDate.getTime() + clockSkewInMs;
  if (postIssued) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenNotActiveYet,
      message: `JWT issued at date claim (iat) is in the future. Issued at date: ${issuedAtDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`,
    });
  }
};
