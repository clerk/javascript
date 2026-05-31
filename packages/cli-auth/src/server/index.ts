export { cliAuth } from './cli-auth';
export { handle } from './handle';

export type {
  AcceptsToken,
  CliAuthFactoryOptions,
  CliAuthInstance,
  HandleOptions,
  ResolveIdentityContext,
  ResolveIdentityFn,
  TokenInfo,
  VerifyTokenContext,
  VerifyTokenFn,
} from './types';

// Cli-auth's narrowed `TokenKind` ('api_key' | 'oauth_token') — m2m is intentionally excluded.
export type { TokenKind } from '../lib/classify-token';
