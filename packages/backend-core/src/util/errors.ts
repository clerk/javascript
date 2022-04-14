import { AuthErrorReason, TokenType, TokenVerificationErrorReason } from '../types';

/* All expected errors thrown calling base.verifySessionToken should be of this type */
export class TokenVerificationError extends Error {
  reason: TokenVerificationErrorReason;
  constructor(reason: TokenVerificationErrorReason) {
    super();
    this.reason = reason;
  }
}

/**
 * The JWT verification process does not need to know about the type of token (header, cookie etc.)
 * To translate the generic errors to mapped AuthErrorReason header responses we map them based on the token type.
 *
 * Here we also steer the flow based on the verification error.
 * `shouldSignout` set as true will lead to a signout, otherwise we throw the interstitial
 *
 * TODO: Can be probably done better with template literals
 */
export function mapErrorReasonResponse(
  reason: TokenVerificationErrorReason,
  tokenType: TokenType,
): { errorReason: AuthErrorReason; shouldSignout: boolean } {
  let errorReason = AuthErrorReason.InternalError;
  let shouldSignout = true;
  const isCookieToken = tokenType === 'cookie';
  switch (+reason) {
    case TokenVerificationErrorReason.Expired:
      errorReason = isCookieToken ? AuthErrorReason.CookieExpired : AuthErrorReason.HeaderExpired;
      shouldSignout = false;
      break;
    case TokenVerificationErrorReason.Invalid:
      errorReason = isCookieToken ? AuthErrorReason.CookieInvalid : AuthErrorReason.HeaderInvalid;
      break;
    case TokenVerificationErrorReason.InvalidIssuer:
      errorReason = isCookieToken ? AuthErrorReason.CookieInvalidIssuer : AuthErrorReason.HeaderInvalidIssuer;
      break;
    case TokenVerificationErrorReason.JWTKeyMissing:
      errorReason = AuthErrorReason.InlineKeyMissing;
      break;
    case TokenVerificationErrorReason.MalformedToken:
      errorReason = isCookieToken ? AuthErrorReason.CookieInvalid : AuthErrorReason.HeaderInvalid;
      break;
    case TokenVerificationErrorReason.NotActiveYet:
      errorReason = isCookieToken ? AuthErrorReason.CookieEarly : AuthErrorReason.HeaderEarly;
      shouldSignout = false;
      break;
    case TokenVerificationErrorReason.UnauthorizedParty:
      errorReason = isCookieToken ? AuthErrorReason.CookieUnauthorizedParty : AuthErrorReason.HeaderUnauthorizedParty;
      break;
    case TokenVerificationErrorReason.VerificationFailed:
      errorReason = isCookieToken ? AuthErrorReason.CookieVerificationFailed : AuthErrorReason.HeaderVerificationFailed;
      break;
    case TokenVerificationErrorReason.PublicKeyFetchError:
      errorReason = AuthErrorReason.PublicKeyFetchError;
      break;
    case TokenVerificationErrorReason.ImportKeyError:
      errorReason = AuthErrorReason.InlineKeyInvalid;
  }

  return { errorReason, shouldSignout };
}
