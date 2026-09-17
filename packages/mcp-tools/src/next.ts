import type { AuthInfo } from '@modelcontextprotocol/server';

import { type ClerkMcpAuth, type ClerkMcpAuthOptions, createClerkMcpAuth as createCore } from './auth';
import type { ToolScopeMap } from './scopes';

export type { ClerkMcpAuthOptions } from './auth';

export type RouteHandler = (request: Request) => Response | Promise<Response>;

export type ClerkMcpNextAuth<TTools extends ToolScopeMap = ToolScopeMap> = Omit<ClerkMcpAuth<TTools>, 'requireAuth'> & {
  /**
   * Wraps a route handler so that it only runs for authorized requests, with the verified `AuthInfo` as
   * `request.auth`. `mcpHandler()` authorizes on its own and does not need it.
   */
  requireAuth(handler: RouteHandler): (request: Request) => Promise<Response>;
};

/**
 * `createClerkMcpAuth()` for Next.js route handlers.
 */
export function createClerkMcpAuth<const TTools extends ToolScopeMap = Record<never, never>>(
  options: ClerkMcpAuthOptions<TTools>,
): ClerkMcpNextAuth<TTools> {
  const core = createCore(options);

  return {
    ...core,
    requireAuth: handler =>
      core.requireAuth((request, authInfo) => {
        (request as Request & { auth?: AuthInfo }).auth = authInfo;
        return handler(request);
      }),
  };
}
