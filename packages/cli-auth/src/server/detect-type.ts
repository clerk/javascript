import { decodeJwt } from '@clerk/backend/jwt';
import { isMachineToken, TokenType } from '@clerk/backend/internal';

import { ClerkCliAuthError } from '../errors';

import type { AcceptsToken } from './types';

const API_KEY_PREFIX = 'ak_';
const M2M_TOKEN_PREFIX = 'mt_';
const OAUTH_TOKEN_PREFIX = 'oat_';
const M2M_SUBJECT_PREFIX = 'mch_';

const JWT_FORMAT = /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;

/** RFC 9068 OAuth 2.0 access token `typ` header values. */
const OAUTH_JWT_TYP_VALUES = ['at+jwt', 'application/at+jwt'] as const;

function isJwtFormat(token: string): boolean {
  return JWT_FORMAT.test(token);
}

/** A JWT-shaped OAuth access token, identified by the RFC 9068 `typ` header. */
function isOAuthJwt(token: string): boolean {
  if (!isJwtFormat(token)) return false;
  const result = decodeJwt(token) as { data?: { header: { typ?: unknown } }; errors?: unknown };
  if (result.errors || !result.data) return false;
  const typ = result.data.header.typ;
  return typeof typ === 'string' && (OAUTH_JWT_TYP_VALUES as readonly string[]).includes(typ);
}

/** A JWT-shaped M2M token, identified by the `mch_` subject prefix. */
function isM2MJwt(token: string): boolean {
  if (!isJwtFormat(token)) return false;
  const result = decodeJwt(token) as { data?: { payload: { sub?: unknown } }; errors?: unknown };
  if (result.errors || !result.data) return false;
  const sub = result.data.payload.sub;
  return typeof sub === 'string' && sub.startsWith(M2M_SUBJECT_PREFIX);
}

/**
 * Detect the token type from a raw bearer string.
 *
 * Mirrors `@clerk/backend`'s `getMachineTokenType` + session-JWT fallback. `oat_*` /
 * opaque OAuth access tokens, `mt_*` M2M tokens, and `ak_*` API keys are recognized by
 * prefix. JWT-shaped tokens are inspected: `typ: at+jwt` (RFC 9068) → OAuth, `sub: mch_*`
 * → M2M, anything else → session token.
 */
export function detectTokenType(token: string): TokenType {
  if (isMachineToken(token)) {
    if (token.startsWith(API_KEY_PREFIX)) {
      return TokenType.ApiKey;
    }
    if (token.startsWith(M2M_TOKEN_PREFIX) || isM2MJwt(token)) {
      return TokenType.M2MToken;
    }
    if (token.startsWith(OAUTH_TOKEN_PREFIX) || isOAuthJwt(token)) {
      return TokenType.OAuthToken;
    }
    // `isMachineToken` matched but no specific branch fired — bail rather than guess.
    throw new ClerkCliAuthError('verify_api_key', 'Recognized machine token but could not determine its type.');
  }
  if (isJwtFormat(token)) {
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
