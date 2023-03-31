import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';

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
