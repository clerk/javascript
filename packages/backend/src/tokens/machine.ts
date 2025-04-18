import type { TokenType } from '../tokens/types';

export const M2M_TOKEN_PREFIX = 'm2m_';
export const OAUTH_TOKEN_PREFIX = 'oauth_';
export const API_KEY_PREFIX = 'api_key_';

const MACHINE_TOKEN_PREFIXES = [M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX] as const;

export function isMachineToken(token: string): boolean {
  return MACHINE_TOKEN_PREFIXES.some(prefix => token.startsWith(prefix));
}

export function getMachineTokenType(token: string): Exclude<TokenType, 'session_token'> {
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return 'machine_token';
  }

  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return 'oauth_token';
  }

  return 'api_key';
}
