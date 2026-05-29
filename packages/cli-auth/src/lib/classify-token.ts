import { type MachineTokenType, TokenType } from '@clerk/backend/internal';
import { decodeJwt } from '@clerk/backend/jwt';

import { ClerkCliAuthError } from '../errors';

/**
 * Token kinds cli-auth accepts as CLI credentials. Narrower than `@clerk/backend`'s
 * `MachineTokenType` — we drop `m2m_token` because M2M tokens are minted by machines for
 * server-to-server BAPI calls, not for a CLI user to send to a backend. For machine
 * identities, use an API key with a `mch_*` subject instead.
 */
export type TokenKind = Exclude<MachineTokenType, typeof TokenType.M2MToken>;

const API_KEY_PREFIX = 'ak_';
const OAUTH_TOKEN_PREFIX = 'oat_';
const JWT_FORMAT = /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;
/** RFC 9068 OAuth 2.0 access token `typ` header values. */
const OAUTH_JWT_TYP_VALUES = ['at+jwt', 'application/at+jwt'] as const;

function isJwtFormat(token: string): boolean {
  return JWT_FORMAT.test(token);
}

/**
 * Classify a credential as an API key or an OAuth access token by prefix / JWT shape:
 *
 * - `ak_*` → `'api_key'` (user/org/machine API keys all share this prefix)
 * - `oat_*` or JWT with `typ: at+jwt` (RFC 9068) → `'oauth_token'`
 *
 * Throws on M2M tokens (`mt_*` or `mch_` subject JWT) and on any unknown shape — M2M is
 * intentionally rejected at the CLI boundary.
 */
export function classifyToken(token: string): TokenKind {
  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return TokenType.OAuthToken;
  }
  if (isJwtFormat(token)) {
    const result = decodeJwt(token) as {
      data?: { header: { typ?: unknown } };
      errors?: unknown;
    };
    if (!result.errors && result.data) {
      const typ = result.data.header.typ;
      if (typeof typ === 'string' && (OAUTH_JWT_TYP_VALUES as readonly string[]).includes(typ)) {
        return TokenType.OAuthToken;
      }
    }
  }
  throw new ClerkCliAuthError(
    'not_authenticated',
    'Unsupported credential. Expected an API key or OAuth access token.',
  );
}
