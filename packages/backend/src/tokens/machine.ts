import { decodeJwt } from '../jwt/verifyJwt';
import type { AuthenticateRequestOptions } from '../tokens/types';
import type { MachineTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';

export const M2M_TOKEN_PREFIX = 'mt_';
export const OAUTH_TOKEN_PREFIX = 'oat_';
export const API_KEY_PREFIX = 'ak_';

const MACHINE_TOKEN_PREFIXES = [M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX] as const;

export const JwtFormatRegExp = /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;

export function isJwtFormat(token: string): boolean {
  return JwtFormatRegExp.test(token);
}

/**
 * Valid OAuth 2.0 JWT access token type values per RFC 9068.
 * @see https://www.rfc-editor.org/rfc/rfc9068.html#section-2.1
 */
export const OAUTH_ACCESS_TOKEN_TYPES = ['at+jwt', 'application/at+jwt'];

/**
 * Checks if a token is an OAuth 2.0 JWT access token.
 * Validates the JWT format and verifies the header 'typ' field matches RFC 9068 values.
 *
 * @param token - The token string to check
 * @returns true if the token is a valid OAuth JWT access token
 * @see https://www.rfc-editor.org/rfc/rfc9068.html#section-2.1
 */
export function isOAuthJwt(token: string): boolean {
  if (!isJwtFormat(token)) {
    return false;
  }
  try {
    const { data, errors } = decodeJwt(token);
    return !errors && !!data && OAUTH_ACCESS_TOKEN_TYPES.includes(data.header.typ as (typeof OAUTH_ACCESS_TOKEN_TYPES)[number]);
  } catch {
    return false;
  }
}

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
 * Checks if a token is a machine token by looking at its prefix or if it's an OAuth JWT access token (RFC 9068).
 *
 * @param token - The token string to check
 * @returns true if the token is a machine token
 */
export function isMachineToken(token: string): boolean {
  return isMachineTokenByPrefix(token) || isOAuthJwt(token);
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
    return TokenType.M2MToken;
  }

  if (token.startsWith(OAUTH_TOKEN_PREFIX) || isOAuthJwt(token)) {
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
 * Checks if a token type string is a machine token type (api_key, m2m_token, or oauth_token).
 *
 * @param type - The token type string to check
 * @returns true if the type is a machine token type
 */
export function isMachineTokenType(type: string): type is MachineTokenType {
  return type === TokenType.ApiKey || type === TokenType.M2MToken || type === TokenType.OAuthToken;
}
