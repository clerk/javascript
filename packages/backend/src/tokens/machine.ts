import type { AuthenticateRequestOptions } from '../tokens/types';
import type { MachineTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';

export const M2M_TOKEN_PREFIX = 'm2m_';
export const OAUTH_TOKEN_PREFIX = 'oauth_access_';
export const API_KEY_PREFIX = 'api_key_';

const MACHINE_TOKEN_PREFIXES = [M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX] as const;

export function isMachineToken(token: string): boolean {
  return MACHINE_TOKEN_PREFIXES.some(prefix => token.startsWith(prefix));
}

export function getMachineTokenType(token: string): MachineTokenType {
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return TokenType.MachineToken;
  }

  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return TokenType.OAuthToken;
  }

  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }

  throw new Error('Unknown machine token type');
}

/**
 * Check if a token type is accepted given a requested token type or list of token types.
 */
export const isTokenTypeAccepted = (
  tokenType: TokenType,
  acceptsToken: NonNullable<AuthenticateRequestOptions['acceptsToken']>,
): boolean => {
  if (acceptsToken === 'any') {
    return true;
  }

  const tokenTypes = Array.isArray(acceptsToken) ? acceptsToken : [acceptsToken];
  return tokenTypes.includes(tokenType);
};
