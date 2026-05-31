import type { ClerkClient } from '@clerk/backend';

import { ClerkCliAuthError } from '../errors';
import type { TokenKind } from '../lib/classify-token';
import type { AcceptsToken, TokenInfo } from './types';

const BEARER_PREFIX = /^Bearer\s+/i;

/** cli-auth's canonical accepted set — m2m and session are intentionally never accepted. */
const DEFAULT_ACCEPTS: readonly TokenKind[] = ['api_key', 'oauth_token'] as const;

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
 * Normalize cli-auth's {@link AcceptsToken} to the `acceptsToken` array
 * `@clerk/backend` expects. `'any'` collapses to the canonical narrowed set so session
 * and m2m tokens are never accidentally accepted even when the caller asks for "any".
 */
function normalizeAccepts(accepts: AcceptsToken | undefined): readonly TokenKind[] {
  if (!accepts || accepts === 'any') {
    return DEFAULT_ACCEPTS;
  }
  return Array.isArray(accepts) ? accepts : [accepts as TokenKind];
}

/**
 * Default token verifier — delegates to `clerk.authenticateRequest`, which detects the
 * token type, looks up the right verification primitive (BAPI for opaque, JWKs for JWTs),
 * and returns an `AuthObject`. We narrow the result to the {@link TokenInfo} shape that
 * downstream consumers (`resolveIdentity`, custom `verifyToken` overrides) work with.
 *
 * Consumers who want richer claims for JWT-shaped tokens (e.g. the full RFC 9068 payload)
 * can decode the bearer inside a custom `resolveIdentity` callback — that hook receives
 * the original `Request`, so the raw token is recoverable via `readBearer(request)`.
 */
export async function verifyTokenWithClerk(
  request: Request,
  options: { accepts?: AcceptsToken; clerk: ClerkClient },
): Promise<TokenInfo> {
  // Cli-auth is bearer-only — require the header up front so consumers get a clear
  // "Missing Authorization header" rather than `authenticateRequest`'s
  // `token-type-mismatch` reason after it falls through to cookie auth and fails.
  readBearer(request);

  const acceptsToken = normalizeAccepts(options.accepts);
  const state = await options.clerk.authenticateRequest(request, { acceptsToken });
  if (state.isAuthenticated === false) {
    throw new ClerkCliAuthError('not_authenticated', state.reason ?? 'Token rejected.');
  }

  const authObj = state.toAuth();
  // `subject`, `scopes`, `tokenType` are top-level on every AuthenticatedMachineObject.
  // `claims` is only present on the `api_key` arm of MachineObjectExtendedProperties —
  // check the property at runtime to avoid leaking the type machinery here.
  const claims = 'claims' in authObj && authObj.claims ? (authObj.claims as Record<string, unknown>) : undefined;

  return {
    subject: authObj.subject,
    type: authObj.tokenType as TokenKind,
    scopes: authObj.scopes,
    claims,
  };
}
