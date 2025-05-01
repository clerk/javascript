export const TokenType = {
  SessionToken: 'session_token',
  ApiKey: 'api_key',
  MachineToken: 'machine_token',
  OAuthToken: 'oauth_token',
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export type SessionTokenType = typeof TokenType.SessionToken;
export type MachineTokenType = Exclude<TokenType, SessionTokenType>;
