import type { ClerkOptions } from '@clerk/backend';
import { isTokenTypeAccepted, type MachineTokenType, verifyMachineAuthToken } from '@clerk/backend/internal';

import { ClerkCliAuthError } from '../errors';
import type { AcceptsToken, TokenInfo } from './types';

const BEARER_PREFIX = /^Bearer\s+/i;

export function readBearer(request: Request): string {
  const header = request.headers.get('authorization');
  if (!header) {
    throw new ClerkCliAuthError('not_authenticated', 'Missing Authorization header.');
  }
  const token = header.replace(BEARER_PREFIX, '').trim();
  if (!token) {
    throw new ClerkCliAuthError('not_authenticated', 'Authorization header is empty.');
  }
  return token;
}

/**
 * Build the `VerifyTokenOptions` payload `verifyMachineAuthToken` expects. The bound
 * `clientConfig` wins; otherwise we fall back to the env vars `@clerk/backend` itself reads.
 */
export function buildVerifyOptions(clientConfig: ClerkOptions | undefined): {
  secretKey: string;
  apiUrl?: string;
  jwtKey?: string;
} {
  const secretKey = clientConfig?.secretKey ?? process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new ClerkCliAuthError(
      'config',
      'cliAuth() needs a Clerk secret key. Pass `clientConfig.secretKey`, or set CLERK_SECRET_KEY in the env.',
    );
  }
  return {
    secretKey,
    apiUrl: clientConfig?.apiUrl ?? process.env.CLERK_API_URL ?? undefined,
    jwtKey: clientConfig?.jwtKey ?? process.env.CLERK_JWT_KEY ?? undefined,
  };
}

/**
 * Default token verifier — delegates to `@clerk/backend`'s `verifyMachineAuthToken`, which
 * detects the token type internally (api_key / m2m_token / oauth_token) and verifies via
 * the appropriate Backend API endpoint or JWT path. Maps the result to {@link TokenInfo}.
 *
 * `accepts` (when provided) gates against the verified `tokenType`; tokens of an unaccepted
 * type fail with `not_authenticated`. Consumers can replace this entirely by passing a
 * `verifyToken` override to `handle()`.
 */
export async function verifyTokenWithClerk(
  token: string,
  options: { accepts?: AcceptsToken; clientConfig?: ClerkOptions },
): Promise<TokenInfo> {
  const verifyOptions = buildVerifyOptions(options.clientConfig);
  const result = await verifyMachineAuthToken(token, verifyOptions);

  const accepts: AcceptsToken = options.accepts ?? 'any';
  if (!isTokenTypeAccepted(result.tokenType, accepts)) {
    throw new ClerkCliAuthError(
      'not_authenticated',
      `Token type "${result.tokenType}" is not accepted by this endpoint.`,
    );
  }

  if (result.errors) {
    throw new ClerkCliAuthError('not_authenticated', result.errors[0].message);
  }

  return mapVerifiedToken(result.data, result.tokenType);
}

interface VerifiedTokenLike {
  subject: string;
  scopes?: string[] | null;
  claims?: Record<string, unknown> | null;
}

function mapVerifiedToken(data: VerifiedTokenLike, type: MachineTokenType): TokenInfo {
  return {
    subject: data.subject,
    type,
    scopes: data.scopes ?? undefined,
    claims: data.claims ?? undefined,
  };
}
