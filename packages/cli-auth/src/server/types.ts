import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import type { TokenType } from '@clerk/backend/internal';

import type { Identity } from '../types';

/**
 * Which token types this endpoint accepts. Mirrors `@clerk/backend`'s `acceptsToken`:
 * a single `TokenType`, a readonly tuple of `TokenType`s, or the literal `'any'`.
 */
export type AcceptsToken = TokenType | readonly TokenType[] | 'any';

/**
 * A Clerk Backend client, either resolved or wrapped in a factory. Passing the factory
 * lets you forward `@clerk/nextjs/server`'s `clerkClient` directly — the SDK calls it
 * lazily on first use, so consumers don't need to `await` at module scope.
 */
export type ClientArg = ClerkClient | (() => ClerkClient | Promise<ClerkClient>);

/**
 * Verified token payload. Returned by `verifyToken` / `verifyTokenFromRequest`
 * and passed into `resolveAuthInfo` as `tokenInfo`.
 */
export interface TokenInfo<T extends TokenType = TokenType> {
  /** The verified token's subject — `user_*`, `org_*`, `mch_*`, or `scim_*`. */
  subject: string;
  /** The verified token type (`session_token` | `api_key` | `m2m_token` | `oauth_token`). */
  type: T;
  /** Scopes attached to the token, when applicable. */
  scopes?: string[];
  /** Raw verified claims/data from `@clerk/backend`. Shape varies by token type. */
  claims?: Record<string, unknown>;
}

/**
 * Context passed to a `verifyToken` callback. `token` is the raw, unverified bearer.
 * `clerk` is the resolved Clerk Backend client (the factory's default, or a route override).
 */
export interface VerifyTokenContext<T extends TokenType = TokenType> {
  /** Raw bearer token from the `Authorization` header. */
  token: string;
  /** Token type detected from the token's prefix / JWT shape. */
  type: T;
  /** Original incoming `Request`. */
  request: Request;
  /** Clerk Backend client, ready to use (`clerk.apiKeys.verify(...)`, `clerk.authenticateRequest(...)`, etc.). */
  clerk: ClerkClient;
}

/**
 * Context passed to a `resolveAuthInfo` callback. The token has already been verified;
 * downstream code reads `tokenInfo.subject` / `.claims`, the original `request`, and the
 * resolved Clerk Backend client.
 */
export interface ResolveAuthInfoContext<T extends TokenType = TokenType> {
  /** The verified token, including subject, type, scopes, and claims. */
  tokenInfo: TokenInfo<T>;
  /** Original incoming `Request`. */
  request: Request;
  /** Clerk Backend client, ready to use (e.g. `clerk.users.getUser(tokenInfo.subject)`). */
  clerk: ClerkClient;
}

/** A `verifyToken` callback returns a verified `TokenInfo` or throws on rejection. */
export type VerifyTokenFn<T extends TokenType = TokenType> = (
  ctx: VerifyTokenContext<T>,
) => Promise<TokenInfo<T>> | TokenInfo<T>;

/** A `resolveAuthInfo` callback shapes the verified token into a `Identity` payload. */
export type ResolveAuthInfoFn<T extends TokenType = TokenType> = (
  ctx: ResolveAuthInfoContext<T>,
) => Promise<Identity> | Identity;

/**
 * Options for the `cliAuth()` factory. Pass either a Clerk Backend client (or a factory
 * returning one) via `client`, or the config used to construct one via `clientConfig`.
 * If neither is given, the factory builds a client from `CLERK_SECRET_KEY` at first use.
 */
export interface CliAuthFactoryOptions {
  /** Pre-configured Clerk Backend client, or a thunk returning one (e.g. `@clerk/nextjs/server`'s `clerkClient`). */
  client?: ClientArg;
  /** Or: the `ClerkOptions` shape `createClerkClient(...)` accepts. */
  clientConfig?: ClerkOptions;
}

/** Options for the bound `handle()` returned by `cliAuth()`. */
export interface HandleOptions<T extends TokenType = TokenType> {
  /** Which token types this endpoint accepts. Rejects every other type with 401. */
  accepts: AcceptsToken;
  /** Per-route client override. Falls back to the factory's client when omitted. */
  client?: ClientArg;
  /** Per-route `clientConfig` override. Falls back to the factory's config when omitted. */
  clientConfig?: ClerkOptions;
  /** Override the verification step. Defaults to a `@clerk/backend`-backed verifier. */
  verifyToken?: VerifyTokenFn<T>;
  /** Override the info-resolution step. Defaults to extracting subject + claims into `Identity`. */
  resolveAuthInfo?: ResolveAuthInfoFn<T>;
}

/**
 * Shape returned by `cliAuth({ client })`. Destructure the bits you need.
 *
 * @example
 * ```ts
 * // lib/clerk-cli.ts
 * import { cliAuth } from '@clerk/cli-auth/server';
 * import { clerkClient } from '@clerk/nextjs/server';
 *
 * export const { handle, verifyToken, verifyTokenFromRequest, resolveAuthInfo } =
 *   cliAuth({ client: clerkClient });
 *
 * // app/api/cli/verify/route.ts
 * export const GET = handle({ accepts: ['api_key', 'oauth_token'] });
 * ```
 */
export interface CliAuthInstance {
  /** Wrap a route handler for any framework using Web `Request`/`Response`. */
  handle: <T extends TokenType>(opts: HandleOptions<T>) => (request: Request) => Promise<Response>;
  /** Primitive verifier: raw bearer in, verified `TokenInfo` out. `clerk` is auto-injected from the factory's client. */
  verifyToken: <T extends TokenType>(
    ctx: Omit<VerifyTokenContext<T>, 'clerk'> & { clerk?: ClerkClient },
  ) => Promise<TokenInfo<T>>;
  /** High-level verifier: `Request` in, verified `TokenInfo` out. Uses the factory's client. */
  verifyTokenFromRequest: <T extends TokenType = TokenType>(
    request: Request,
    options: { accepts: AcceptsToken },
  ) => Promise<TokenInfo<T>>;
  /** Default resolver: project a verified `TokenInfo` into `Identity`. Sync today, but typed `Identity | Promise<Identity>` so consumer-supplied resolvers can be async. */
  resolveAuthInfo: <T extends TokenType>(
    ctx: Omit<ResolveAuthInfoContext<T>, 'clerk'> & { clerk?: ClerkClient },
  ) => Identity | Promise<Identity>;
}
