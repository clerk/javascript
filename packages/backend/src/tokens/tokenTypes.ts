export const TokenType = {
  SessionToken: 'session_token',
  ApiKey: 'api_key',
  MachineToken: 'machine_token',
  OAuthToken: 'oauth_token',
} as const;

/**
 * @inline
 */
export type TokenType = (typeof TokenType)[keyof typeof TokenType];

/**
 * @inline
 */
export type SessionTokenType = typeof TokenType.SessionToken;
/**
 * @inline
 */
export type MachineTokenType = Exclude<TokenType, SessionTokenType>;
