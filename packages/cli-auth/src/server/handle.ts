import type { MachineTokenType } from '@clerk/backend/internal';

import { ClerkCliAuthError, EXIT_CODE } from '../errors';
import { classifyToken } from '../lib/classify-token';
import { resolveAuthInfo as defaultResolveAuthInfo, validateIdentity } from './resolve-auth';
import type { HandleOptions, TokenInfo } from './types';
import { readBearer } from './verify-token';

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

async function verifyForHandle<T extends MachineTokenType>(
  request: Request,
  options: HandleOptions<T>,
): Promise<TokenInfo<T>> {
  if (!options.verifyToken) {
    return options.auth.verifyTokenFromRequest<T>(request, { accepts: options.accepts });
  }
  // Custom verifier: classify, then pass the bound Clerk client through.
  const token = readBearer(request);
  const type = classifyToken(token) as T;
  const clerk = await options.auth.getClerk();
  return options.verifyToken({ token, type, request, clerk });
}

/**
 * Standalone route handler: wraps a `cliAuth()` instance into a Web `Request → Response`
 * function for any framework that speaks the Fetch API (Next.js App Router, Hono,
 * SvelteKit, Remix, plain Node `fetch`, etc.).
 *
 * @example
 * ```ts
 * // lib/clerk-cli.ts
 * import { cliAuth } from '@clerk/cli-auth/server';
 * import { clerkClient } from '@clerk/nextjs/server';
 *
 * export const auth = cliAuth({ client: clerkClient });
 *
 * // app/api/cli/identity/route.ts
 * import { handle } from '@clerk/cli-auth/server';
 * import { auth } from '@/lib/clerk-cli';
 *
 * export const GET = handle({
 *   auth,
 *   accepts: ['api_key', 'm2m_token', 'oauth_token'],
 *   // Optional overrides:
 *   // verifyToken: ({ token, type, request, clerk }) => ...
 *   // resolveAuthInfo: ({ tokenInfo, request, clerk }) => ...
 * });
 * ```
 */
export function handle<T extends MachineTokenType = MachineTokenType>(
  options: HandleOptions<T>,
): (request: Request) => Promise<Response> {
  return async function routeHandler(request: Request): Promise<Response> {
    try {
      const tokenInfo = await verifyForHandle<T>(request, options);
      const clerk = await options.auth.getClerk();
      const resolver = options.resolveAuthInfo ?? defaultResolveAuthInfo;
      const raw = await resolver({ tokenInfo, request, clerk });
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
