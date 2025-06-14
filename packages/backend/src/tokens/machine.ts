import type { AuthenticateRequestOptions } from '../tokens/types';
import type { MachineTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';

export const M2M_TOKEN_PREFIX = 'mt_';
export const OAUTH_TOKEN_PREFIX = 'oat_';
export const API_KEY_PREFIX = 'ak_';

const MACHINE_TOKEN_PREFIXES = [M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX] as const;

/**
 * Checks if a token is a machine token by looking at its prefix.
 *
 * @remarks
 * In the future, this will support custom prefixes that can be prepended to the base prefixes
 * (e.g. "org_a_m2m_", "org_a_oauth_access_", "org_a_api_key_")
 *
 * @param token - The token string to check
 * @returns true if the token starts with a recognized machine token prefix
 */
export function isMachineTokenByPrefix(token: string): boolean {
  return MACHINE_TOKEN_PREFIXES.some(prefix => token.startsWith(prefix));
}

/**
 * Gets the specific type of machine token based on its prefix.
 *
 * @remarks
 * In the future, this will support custom prefixes that can be prepended to the base prefixes
 * (e.g. "org_a_m2m_", "org_a_oauth_access_", "org_a_api_key_")
 *
 * @param token - The token string to check
 * @returns The specific MachineTokenType
 * @throws Error if the token doesn't match any known machine token prefix
 */
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
 *
 * @param tokenType - The token type to check (can be null if the token is invalid)
 * @param acceptsToken - The requested token type or list of token types
 * @returns true if the token type is accepted
 */
export const isTokenTypeAccepted = (
  tokenType: TokenType | null,
  acceptsToken: NonNullable<AuthenticateRequestOptions['acceptsToken']>,
): boolean => {
  if (!tokenType) {
    return false;
  }

  if (acceptsToken === 'any') {
    return true;
  }

  const tokenTypes = Array.isArray(acceptsToken) ? acceptsToken : [acceptsToken];
  return tokenTypes.includes(tokenType);
};

/**
 * Checks if a token type string is a machine token type (api_key, machine_token, or oauth_token).
 *
 * @param type - The token type string to check
 * @returns true if the type is a machine token type
 */
export function isMachineTokenType(type: string): type is MachineTokenType {
  return type === TokenType.ApiKey || type === TokenType.MachineToken || type === TokenType.OAuthToken;
}
