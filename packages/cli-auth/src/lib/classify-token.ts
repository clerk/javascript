/**
 * Token kind values. Mirror `@clerk/backend`'s `TokenType` vocabulary so consumers can
 * route on the same identifiers across the SDK and the backend.
 */
export type TokenKind = 'session_token' | 'api_key' | 'm2m_token' | 'oauth_token';

/**
 * Classify a token by its prefix. `ak_*` → `'api_key'`, `mt_*` → `'m2m_token'`,
 * `oat_*` → `'oauth_token'`. Anything else (JWT-shaped session tokens) → `'session_token'`.
 */
export function classifyToken(token: string): TokenKind {
  if (token.startsWith('ak_')) {
    return 'api_key';
  }
  if (token.startsWith('mt_')) {
    return 'm2m_token';
  }
  if (token.startsWith('oat_')) {
    return 'oauth_token';
  }
  return 'session_token';
}
