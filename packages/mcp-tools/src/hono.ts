import type { AuthInfo, CreateMcpHandlerOptions, McpServerFactory } from '@modelcontextprotocol/server';
import type { Context, Handler, MiddlewareHandler } from 'hono';

import { type ClerkMcpAuth, type ClerkMcpAuthOptions, createClerkMcpAuth as createCore } from './auth';
import type { ToolScopeMap } from './scopes';

export type { ClerkMcpAuthOptions } from './auth';

declare module 'hono' {
  interface ContextVariableMap {
    authInfo?: AuthInfo;
    parsedBody?: unknown;
  }
}

export type ClerkMcpHonoAuth<TTools extends ToolScopeMap = ToolScopeMap> = Omit<
  ClerkMcpAuth<TTools>,
  'requireAuth' | 'protectedResourceMetadata' | 'authorizationServerMetadata' | 'mcpHandler'
> & {
  /**
   * Authorizes requests to your own handlers and stores the verified `AuthInfo` as `c.get('authInfo')`.
   * `mcpHandler()` authorizes on its own and does not need it.
   */
  requireAuth(): MiddlewareHandler;
  protectedResourceMetadata(): Handler;
  authorizationServerMetadata(): Handler;
  /**
   * Serves MCP requests. Authorizes each request, then dispatches it to a server built by `factory`.
   */
  mcpHandler(factory: McpServerFactory, options?: CreateMcpHandlerOptions): Handler;
};

/**
 * `createClerkMcpAuth()` with handlers in Hono's shape. Reads the body that `createMcpHonoApp()` from
 * `@modelcontextprotocol/hono` parses, and falls back to reading the request.
 */
export function createClerkMcpAuth<const TTools extends ToolScopeMap = Record<never, never>>(
  options: ClerkMcpAuthOptions<TTools>,
): ClerkMcpHonoAuth<TTools> {
  const core = createCore(options);
  const protectedResource = core.protectedResourceMetadata();
  const authorizationServer = core.authorizationServerMetadata();

  return {
    ...core,
    requireAuth: () => async (c, next) => {
      if (c.req.method === 'OPTIONS') {
        return next();
      }
      const result = await core.authenticate(c.req.raw, { parsedBody: c.get('parsedBody') });
      if (result instanceof Response) {
        return result;
      }
      c.set('authInfo', result);
      await next();
    },
    protectedResourceMetadata: () => (c: Context) => protectedResource(c.req.raw),
    authorizationServerMetadata: () => (c: Context) => authorizationServer(c.req.raw),
    mcpHandler: (factory, handlerOptions) => {
      const handler = core.mcpHandler(factory, handlerOptions);
      return (c: Context) => handler(c.req.raw, { parsedBody: c.get('parsedBody') });
    },
  };
}
