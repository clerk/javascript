export { createClerkMcpAuth } from './auth';
export type {
  AuthenticateOptions,
  AuthenticatedFetchHandler,
  ClerkMcpAuth,
  ClerkMcpAuthOptions,
  ExchangeTokenOptions,
  FetchHandler,
  ScopeDefinition,
  ScopedToolHandler,
  ToolHandler,
  ToolResult,
} from './auth';
export { ClerkMcpError } from './errors';
export type { ClerkMcpErrorCode } from './errors';
export type { ExchangedToken } from './exchange';
export type { ToolScopeMap, ToolScopes } from './scopes';
export type { ClerkMcpAuthFailureReason, ClerkMcpTelemetry, ClerkMcpTelemetryEvent } from './telemetry';
export { createClerkOAuthTokenVerifier } from './verifier';
export type { ClerkOAuthTokenVerifierOptions } from './verifier';
