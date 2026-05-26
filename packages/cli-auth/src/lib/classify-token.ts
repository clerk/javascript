export type TokenKind = 'oauth' | 'api_key';

/** `ak_*` → API key, anything else → OAuth (opaque or JWT). */
export function classifyToken(token: string): TokenKind {
  return token.startsWith('ak_') ? 'api_key' : 'oauth';
}
