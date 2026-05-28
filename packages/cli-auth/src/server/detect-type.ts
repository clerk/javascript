import { isMachineToken, TokenType } from '@clerk/backend/internal';

import { ClerkCliAuthError } from '../errors';
import type { AcceptsToken } from './types';

const M2M_TOKEN_PREFIX = 'mt_';
const OAUTH_TOKEN_PREFIX = 'oat_';
const API_KEY_PREFIX = 'ak_';

const JWT_FORMAT = /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;

/**
 * Detect the token type from a raw bearer string. Mirrors `@clerk/backend`'s own
 * discrimination: prefix-based for machine tokens, JWT shape for sessions.
 *
 * `getMachineTokenType` and `isJwtFormat` aren't re-exported from `@clerk/backend/internal`,
 * so we inline minimal equivalents using `isMachineToken` for the prefix check.
 */
export function detectTokenType(token: string): TokenType {
  if (isMachineToken(token)) {
    if (token.startsWith(API_KEY_PREFIX)) {
      return TokenType.ApiKey;
    }
    if (token.startsWith(M2M_TOKEN_PREFIX)) {
      return TokenType.M2MToken;
    }
    if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
      return TokenType.OAuthToken;
    }
    // JWT-shaped machine token (OAuth or M2M based on JWT typ/sub) — treat as oauth_token
    // since it's the more common path; consumers can override `verifyToken` if they need M2M JWT.
    return TokenType.OAuthToken;
  }
  if (JWT_FORMAT.test(token)) {
    return TokenType.SessionToken;
  }
  throw new ClerkCliAuthError('verify_api_key', 'Unable to determine token type for credential.');
}

/**
 * Return true if `detected` is in the consumer's `accepts` list. Mirrors
 * `@clerk/backend`'s `isTokenTypeAccepted`.
 */
export function isTokenTypeAccepted(detected: TokenType, accepts: AcceptsToken): boolean {
  if (accepts === 'any') {
    return true;
  }
  const list = Array.isArray(accepts) ? accepts : [accepts as TokenType];
  return list.includes(detected);
}
