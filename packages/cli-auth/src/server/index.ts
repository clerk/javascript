export { cliAuth } from './cli-auth';
export { handle } from './handle';

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

// Re-export the canonical `MachineTokenType` and `isTokenTypeAccepted` from `@clerk/backend`
// so consumers don't have to dual-import.
export { isTokenTypeAccepted, TokenType } from '@clerk/backend/internal';
export type { MachineTokenType } from '@clerk/backend/internal';
