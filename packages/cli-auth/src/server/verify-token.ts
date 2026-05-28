import type { ClerkClient } from '@clerk/backend';
import { TokenType, type TokenType as TokenTypeT } from '@clerk/backend/internal';

import { ClerkCliAuthError } from '../errors';
import { detectTokenType, isTokenTypeAccepted } from './detect-type';
import type { AcceptsToken, TokenInfo, VerifyTokenContext, VerifyTokenFn } from './types';

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
 * Default token verifier — uses the `clerk` client from ctx to verify each supported token type.
 *
 * - `api_key`: `clerk.apiKeys.verify({ secret: token })`
 * - `session_token` / `m2m_token` / `oauth_token`: `clerk.authenticateRequest(request, { acceptsToken: [type] })`
 *
 * Consumers can replace this entirely by passing a `verifyToken` to `cliAuth()` or `handle()`.
 */
export async function defaultVerifyToken<T extends TokenTypeT>(ctx: VerifyTokenContext<T>): Promise<TokenInfo<T>> {
  const { clerk } = ctx;

  if (ctx.type === TokenType.ApiKey) {
    try {
      const apiKey = (await clerk.apiKeys.verify({ secret: ctx.token })) as unknown as {
        subject: string;
        scopes?: string[];
        revoked?: boolean;
        expired?: boolean;
        claims?: Record<string, unknown>;
      };
      if (apiKey.revoked || apiKey.expired) {
        throw new ClerkCliAuthError('verify_api_key', 'API key revoked or expired.');
      }
      return {
        subject: apiKey.subject,
        type: ctx.type,
        scopes: apiKey.scopes,
        claims: apiKey.claims,
      };
    } catch (error) {
      if (error instanceof ClerkCliAuthError) {
        throw error;
      }
      throw new ClerkCliAuthError('verify_api_key', `API key verification failed: ${(error as Error).message}`);
    }
  }

  // OAuth / M2M / session — delegate to authenticateRequest.
  try {
    const state = (await clerk.authenticateRequest(ctx.request, { acceptsToken: [ctx.type] })) as unknown as {
      isAuthenticated?: boolean;
      reason?: string;
      toAuth?: () => { subject?: string; userId?: string; scopes?: string[]; claims?: Record<string, unknown> } | null;
    };
    if (state.isAuthenticated === false) {
      throw new ClerkCliAuthError('not_authenticated', state.reason ?? 'Token rejected by Clerk.');
    }
    const auth = state.toAuth?.();
    if (!auth) {
      throw new ClerkCliAuthError('not_authenticated', 'authenticateRequest returned no auth payload.');
    }
    const subject = auth.subject ?? auth.userId;
    if (typeof subject !== 'string' || !subject) {
      throw new ClerkCliAuthError('not_authenticated', 'Verified token had no subject.');
    }
    return {
      subject,
      type: ctx.type,
      scopes: auth.scopes,
      claims: auth.claims,
    };
  } catch (error) {
    if (error instanceof ClerkCliAuthError) {
      throw error;
    }
    throw new ClerkCliAuthError('not_authenticated', `Token verification failed: ${(error as Error).message}`);
  }
}

/**
 * Internal: end-to-end pipeline used by `handle()`. Read bearer, detect type, gate on
 * `accepts`, run the (default or overridden) verifier with the resolved `clerk` injected.
 */
export async function runHandlePipeline(
  request: Request,
  options: {
    accepts: AcceptsToken;
    verifyToken: VerifyTokenFn;
    getClerk: () => Promise<ClerkClient>;
  },
): Promise<{ tokenInfo: TokenInfo; rawToken: string }> {
  const token = readBearer(request);
  const type = detectTokenType(token);

  if (!isTokenTypeAccepted(type, options.accepts)) {
    throw new ClerkCliAuthError('not_authenticated', `Token type "${type}" is not accepted by this endpoint.`);
  }

  const clerk = await options.getClerk();
  const tokenInfo = await options.verifyToken({ token, type, request, clerk });
  return { tokenInfo, rawToken: token };
}
