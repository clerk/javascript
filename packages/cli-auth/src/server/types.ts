import type { ClerkClient, ClerkOptions } from '@clerk/backend';

import type { TokenKind } from '../lib/classify-token';
import type { Identity } from '../types';

/**
 * Which token types this endpoint accepts: a single {@link TokenKind}, a readonly tuple of
 * them, or the literal `'any'`. Narrower than `@clerk/backend`'s `acceptsToken` — m2m tokens
 * and session tokens are both intentionally excluded from the CLI threat model.
 */
export type AcceptsToken = TokenKind | readonly TokenKind[] | 'any';

/**
 * A Clerk Backend client, either resolved or wrapped in a factory. Passing the factory
 * lets you forward `@clerk/nextjs/server`'s `clerkClient` directly — the SDK calls it
 * lazily on first use, so consumers don't need to `await` at module scope.
 */
export type ClientArg = ClerkClient | (() => ClerkClient | Promise<ClerkClient>);

/**
 * Verified token payload. Returned by `verifyToken` / `verifyTokenFromRequest`
 * and passed into `resolveIdentity` as `tokenInfo`.
 */
export interface TokenInfo<T extends TokenKind = TokenKind> {
  /** The verified token's subject — `user_*`, `org_*`, `mch_*`, or `scim_*`. */
  subject: string;
  /** The verified token type (`api_key` | `oauth_token`). */
  type: T;
  /** Scopes attached to the token, when applicable. */
  scopes?: string[];
  /** Raw verified claims/data from `@clerk/backend`. Shape varies by token type. */
  claims?: Record<string, unknown>;
}

/**
 * Context passed to a `verifyToken` override. `token` is the raw, unverified bearer.
 * `type` is the auto-detected token type; `clerk` is the resolved Clerk Backend client.
 */
export interface VerifyTokenContext<T extends TokenKind = TokenKind> {
  /** Raw bearer token from the `Authorization` header. */
  token: string;
  /** Token type auto-detected from the token's prefix / JWT shape. */
  type: T;
  /** Original incoming `Request`. */
  request: Request;
  /** Clerk Backend client, ready to use (`clerk.apiKeys.verify(...)`, `clerk.authenticateRequest(...)`, etc.). */
  clerk: ClerkClient;
}

/**
 * Context passed to a `resolveIdentity` callback. The token has already been verified;
 * downstream code reads `tokenInfo.subject` / `.claims`, the original `request`, and the
 * resolved Clerk Backend client.
 */
export interface ResolveIdentityContext<T extends TokenKind = TokenKind> {
  /** The verified token, including subject, type, scopes, and claims. */
  tokenInfo: TokenInfo<T>;
  /** Original incoming `Request`. */
  request: Request;
  /** Clerk Backend client, ready to use (e.g. `clerk.users.getUser(tokenInfo.subject)`). */
  clerk: ClerkClient;
}

/** A `verifyToken` callback returns a verified `TokenInfo` or throws on rejection. */
export type VerifyTokenFn<T extends TokenKind = TokenKind> = (
  ctx: VerifyTokenContext<T>,
) => Promise<TokenInfo<T>> | TokenInfo<T>;

/** A `resolveIdentity` callback shapes the verified token into a `Identity` payload. */
export type ResolveIdentityFn<T extends TokenKind = TokenKind> = (
  ctx: ResolveIdentityContext<T>,
) => Promise<Identity> | Identity;

/**
 * Options for the `cliAuth()` factory. Pass either a Clerk Backend client (or a factory
 * returning one) via `client`, or the config used to construct one via `clientConfig`.
 * If neither is given, the factory builds a client from `CLERK_SECRET_KEY` at first use.
 *
 * `clientConfig.secretKey` (or `CLERK_SECRET_KEY`) is also what `verifyToken` /
 * `verifyTokenFromRequest` pass to `@clerk/backend`'s `verifyMachineAuthToken`.
 */
export interface CliAuthFactoryOptions {
  /** Pre-configured Clerk Backend client, or a thunk returning one (e.g. `@clerk/nextjs/server`'s `clerkClient`). */
  client?: ClientArg;
  /** Or: the `ClerkOptions` shape `createClerkClient(...)` accepts. */
  clientConfig?: ClerkOptions;
}

/**
 * Options for the standalone `handle()` export. Pass the `cliAuth()` instance you want to
 * bind the route to via `auth`. Per-route Clerk client overrides aren't supported — make
 * another `cliAuth()` instance instead.
 */
export interface HandleOptions<T extends TokenKind = TokenKind> {
  /** `cliAuth()` instance whose bound Clerk client and verifier/resolver this route should use. */
  auth: CliAuthInstance;
  /** Which token types this endpoint accepts. Rejects every other type with 401. Defaults to `'any'`. */
  accepts?: AcceptsToken;
  /** Override the verification step. Defaults to a `verifyMachineAuthToken`-backed verifier. */
  verifyToken?: VerifyTokenFn<T>;
  /** Override the info-resolution step. Defaults to extracting subject + claims into `Identity`. */
  resolveIdentity?: ResolveIdentityFn<T>;
}

/**
 * Shape returned by `cliAuth({ client })`. Pair it with the standalone `handle()` export, or
 * call its instance methods directly inside your own route logic.
 *
 * @example
 * ```ts
 * // lib/clerk-cli.ts
 * import { cliAuth } from '@clerk/cli-auth/server';
 * import { clerkClient } from '@clerk/nextjs/server';
 *
 * export const auth = cliAuth({ client: clerkClient });
 *
 * // app/api/cli/verify/route.ts
 * import { handle } from '@clerk/cli-auth/server';
 * import { auth } from '@/lib/clerk-cli';
 *
 * export const GET = handle({ auth, accepts: ['api_key', 'oauth_token'] });
 * ```
 */
export interface CliAuthInstance {
  /**
   * Primitive verifier — raw bearer in, verified `TokenInfo` out. Auto-detects token type
   * via `@clerk/backend`'s `verifyMachineAuthToken`, optionally gating against `accepts`.
   */
  verifyToken: <T extends TokenKind = TokenKind>(
    token: string,
    options?: { accepts?: AcceptsToken },
  ) => Promise<TokenInfo<T>>;
  /**
   * Request-level verifier — reads `Authorization: Bearer <token>`, then defers to
   * `verifyToken(token, options)`.
   */
  verifyTokenFromRequest: <T extends TokenKind = TokenKind>(
    request: Request,
    options?: { accepts?: AcceptsToken },
  ) => Promise<TokenInfo<T>>;
  /** Default resolver: project a verified `TokenInfo` into `Identity`. Sync today, but typed `Identity | Promise<Identity>` so consumer-supplied resolvers can be async. */
  resolveIdentity: <T extends TokenKind>(
    ctx: Omit<ResolveIdentityContext<T>, 'clerk'> & { clerk?: ClerkClient },
  ) => Identity | Promise<Identity>;
  /** Resolve the bound Clerk Backend SDK client. Cached after the first call. */
  getClerk: () => Promise<ClerkClient>;
}
