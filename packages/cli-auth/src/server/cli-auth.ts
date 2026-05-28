import { type ClerkClient, type ClerkOptions, createClerkClient } from '@clerk/backend';
import type { MachineTokenType } from '@clerk/backend/internal';

import { ClerkCliAuthError } from '../errors';
import { resolveAuthInfo as defaultResolveAuthInfo } from './resolve-auth';
import type {
  AcceptsToken,
  CliAuthFactoryOptions,
  CliAuthInstance,
  ClientArg,
  ResolveAuthInfoContext,
  TokenInfo,
} from './types';
import { readBearer, verifyTokenWithClerk } from './verify-token';

/** Build a getClerk thunk for the given factory options, with a single-flight cache. */
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
 * `CLERK_SECRET_KEY`) and return an instance with verifier helpers. Pair the instance with
 * the standalone {@link handle} export to wire up route handlers.
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
 * export const auth = cliAuth({ client: clerkClient });
 *
 * // app/api/cli/verify/route.ts
 * import { handle } from '@clerk/cli-auth/server';
 * import { auth } from '@/lib/clerk-cli';
 *
 * export const GET = handle({ auth, accepts: ['api_key', 'oauth_token'] });
 *
 * // Or use the primitive directly inside a custom protected route:
 * const tokenInfo = await auth.verifyTokenFromRequest(request, { accepts: 'api_key' });
 * ```
 */
export function cliAuth(options: CliAuthFactoryOptions = {}): CliAuthInstance {
  const getClerk = makeClerkGetter(options.client, options.clientConfig);

  async function verifyToken<T extends MachineTokenType = MachineTokenType>(
    token: string,
    verifyOptions?: { accepts?: AcceptsToken },
  ): Promise<TokenInfo<T>> {
    const info = await verifyTokenWithClerk(token, {
      accepts: verifyOptions?.accepts,
      clientConfig: options.clientConfig,
    });
    return info as TokenInfo<T>;
  }

  async function verifyTokenFromRequest<T extends MachineTokenType = MachineTokenType>(
    request: Request,
    verifyOptions?: { accepts?: AcceptsToken },
  ): Promise<TokenInfo<T>> {
    const token = readBearer(request);
    return verifyToken<T>(token, verifyOptions);
  }

  function resolveAuthInfo<T extends MachineTokenType>(
    ctx: Omit<ResolveAuthInfoContext<T>, 'clerk'> & { clerk?: ClerkClient },
  ): ReturnType<typeof defaultResolveAuthInfo> {
    return defaultResolveAuthInfo(ctx as ResolveAuthInfoContext<T>);
  }

  return {
    verifyToken,
    verifyTokenFromRequest,
    resolveAuthInfo,
    getClerk,
  };
}
