import { type MachineTokenType, TokenType } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

import { ClerkCliAuthError } from '../errors';

/**
 * Token kind values. Re-export of `@clerk/backend`'s `MachineTokenType` —
 * `'api_key' | 'm2m_token' | 'oauth_token'`. Session tokens are intentionally
 * excluded; the CLI flow never holds a browser session credential.
 */
export type TokenKind = MachineTokenType;

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

/**
 * Classify a token by prefix or JWT claims. Mirrors `@clerk/backend`'s internal
 * `getMachineTokenType`:
 *
 * - `ak_*` → `'api_key'`
 * - `mt_*` or JWT with `sub: mch_*` → `'m2m_token'`
 * - `oat_*` or JWT with `typ: at+jwt` (RFC 9068) → `'oauth_token'`
 *
 * Throws when the token doesn't match any known machine-token shape.
 */
export function classifyToken(token: string): TokenKind {
  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return TokenType.M2MToken;
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return TokenType.OAuthToken;
  }
  if (isJwtFormat(token)) {
    const result = decodeJwt(token) as {
      data?: { header: { typ?: unknown }; payload: { sub?: unknown } };
      errors?: unknown;
    };
    if (!result.errors && result.data) {
      const sub = result.data.payload.sub;
      if (typeof sub === 'string' && sub.startsWith(M2M_SUBJECT_PREFIX)) {
        return TokenType.M2MToken;
      }
      const typ = result.data.header.typ;
      if (typeof typ === 'string' && (OAUTH_JWT_TYP_VALUES as readonly string[]).includes(typ)) {
        return TokenType.OAuthToken;
      }
    }
  }
  throw new ClerkCliAuthError('not_authenticated', 'Unable to determine token type for credential.');
}
