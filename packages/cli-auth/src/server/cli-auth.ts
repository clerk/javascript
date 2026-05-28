import { type ClerkClient, type ClerkOptions, createClerkClient } from '@clerk/backend';
import type { TokenType } from '@clerk/backend/internal';

import { ClerkCliAuthError, EXIT_CODE } from '../errors';
import { detectTokenType, isTokenTypeAccepted } from './detect-type';
import { resolveAuthInfo as defaultResolveAuthInfo, validateIdentity } from './resolve-auth';
import type {
  CliAuthFactoryOptions,
  CliAuthInstance,
  ClientArg,
  HandleOptions,
  ResolveAuthInfoContext,
  TokenInfo,
  VerifyTokenContext,
  VerifyTokenFn,
} from './types';
import { defaultVerifyToken, readBearer, runHandlePipeline } from './verify-token';

function statusFor(code: string): number {
  switch (code) {
    case 'not_authenticated':
    case 'verify_api_key':
    case 'userinfo':
      return 401;
    case 'config':
      return 500;
    case 'timeout':
      return 504;
    default:
      return 500;
  }
}

function jsonError(error: ClerkCliAuthError): Response {
  return Response.json(
    { error: error.code, error_description: error.message, exit_code: error.exitCode ?? EXIT_CODE.GENERAL },
    { status: statusFor(error.code) },
  );
}

/** Build a getClerk thunk for the given factory/route options, with a single-flight cache. */
function makeClerkGetter(
  client: ClientArg | undefined,
  clientConfig: ClerkOptions | undefined,
): () => Promise<ClerkClient> {
  let cached: ClerkClient | null = null;
  let pending: Promise<ClerkClient> | null = null;

  return async function getClerk(): Promise<ClerkClient> {
    if (cached) {
      return cached;
    }
    if (pending) {
      return pending;
    }

    pending = (async () => {
      if (client) {
        const resolved = typeof client === 'function' ? await client() : client;
        cached = resolved;
        return resolved;
      }
      if (clientConfig) {
        cached = createClerkClient(clientConfig);
        return cached;
      }
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        throw new ClerkCliAuthError(
          'config',
          'cliAuth() needs a Clerk Backend client. Pass `client`, `clientConfig`, or set CLERK_SECRET_KEY in the env.',
        );
      }
      cached = createClerkClient({ secretKey });
      return cached;
    })();

    try {
      return await pending;
    } finally {
      pending = null;
    }
  };
}

/**
 * Factory: bind a Clerk Backend client (via `client`, `clientConfig`, or auto-built from
 * `CLERK_SECRET_KEY`) and return a set of helpers ready to drop into your routes.
 *
 * `client` accepts either a resolved `ClerkClient` or a factory function (sync or async)
 * — pass `@clerk/nextjs/server`'s `clerkClient` directly, no top-level `await` required.
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
 * import { handle } from '@/lib/clerk-cli';
 *
 * export const GET = handle({
 *   accepts: ['api_key', 'oauth_token'],
 *   // Optional per-route overrides:
 *   // client / clientConfig — different Clerk client for this route only
 *   // verifyToken: ({ token, type, request, clerk }) => ...
 *   // resolveAuthInfo: ({ tokenInfo, request, clerk }) => ...
 * });
 * ```
 */
export function cliAuth(options: CliAuthFactoryOptions = {}): CliAuthInstance {
  const factoryGetClerk = makeClerkGetter(options.client, options.clientConfig);

  async function verifyToken<T extends TokenType>(
    ctx: Omit<VerifyTokenContext<T>, 'clerk'> & { clerk?: ClerkClient },
  ): Promise<TokenInfo<T>> {
    const clerk = ctx.clerk ?? (await factoryGetClerk());
    return defaultVerifyToken({ ...ctx, clerk } as VerifyTokenContext<T>);
  }

  async function verifyTokenFromRequest<T extends TokenType = TokenType>(
    request: Request,
    routeOptions: { accepts: HandleOptions['accepts'] },
  ): Promise<TokenInfo<T>> {
    const token = readBearer(request);
    const type = detectTokenType(token);
    if (!isTokenTypeAccepted(type, routeOptions.accepts)) {
      throw new ClerkCliAuthError('not_authenticated', `Token type "${type}" is not accepted by this endpoint.`);
    }
    return verifyToken({ token, type: type as T, request });
  }

  function resolveAuthInfo<T extends TokenType>(
    ctx: Omit<ResolveAuthInfoContext<T>, 'clerk'> & { clerk?: ClerkClient },
  ): ReturnType<typeof defaultResolveAuthInfo> {
    return defaultResolveAuthInfo(ctx as ResolveAuthInfoContext<T>);
  }

  function handle<T extends TokenType>(routeOptions: HandleOptions<T>): (request: Request) => Promise<Response> {
    // Per-route client override gets its own getter; falls back to the factory's getter
    // when neither override is supplied.
    const routeGetClerk =
      routeOptions.client || routeOptions.clientConfig
        ? makeClerkGetter(routeOptions.client, routeOptions.clientConfig)
        : factoryGetClerk;

    return async function routeHandler(request: Request): Promise<Response> {
      try {
        const verifier = (routeOptions.verifyToken ?? defaultVerifyToken) as unknown as VerifyTokenFn;

        const { tokenInfo } = await runHandlePipeline(request, {
          accepts: routeOptions.accepts,
          verifyToken: verifier,
          getClerk: routeGetClerk,
        });

        const clerk = await routeGetClerk();
        const resolver = routeOptions.resolveAuthInfo ?? defaultResolveAuthInfo;
        const raw = await resolver({ tokenInfo: tokenInfo as TokenInfo<T>, request, clerk });
        const info = validateIdentity(raw);

        return Response.json(info, { status: 200 });
      } catch (error) {
        if (error instanceof ClerkCliAuthError) {
          return jsonError(error);
        }
        return jsonError(new ClerkCliAuthError('config', `Unexpected error: ${(error as Error).message}`));
      }
    };
  }

  return {
    handle,
    verifyToken,
    verifyTokenFromRequest,
    resolveAuthInfo,
  };
}
