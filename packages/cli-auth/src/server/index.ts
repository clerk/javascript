export { cliAuth } from './cli-auth';
export { detectTokenType, isTokenTypeAccepted } from './detect-type';

export type {
  AcceptsToken,
  CliAuthFactoryOptions,
  CliAuthInstance,
  HandleOptions,
  ResolveAuthInfoContext,
  ResolveAuthInfoFn,
  TokenInfo,
  VerifyTokenContext,
  VerifyTokenFn,
} from './types';

// Re-export the canonical TokenType from @clerk/backend so consumers don't have to dual-import.
export { TokenType } from '@clerk/backend/internal';
