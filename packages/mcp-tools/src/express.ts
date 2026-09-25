import { toNodeHandler } from '@modelcontextprotocol/node';
import type { AuthInfo, CreateMcpHandlerOptions, McpServerFactory } from '@modelcontextprotocol/server';
import { createMcpHandler } from '@modelcontextprotocol/server';
import type { Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express';
import express from 'express';

import { type ClerkMcpAuth, type ClerkMcpAuthOptions, createClerkMcpAuth as createCore } from './auth';
import type { ToolScopeMap } from './scopes';

export type { ClerkMcpAuthOptions } from './auth';

export type ClerkMcpExpressAuth<TTools extends ToolScopeMap = ToolScopeMap> = Omit<
  ClerkMcpAuth<TTools>,
  'requireAuth' | 'protectedResourceMetadata' | 'authorizationServerMetadata' | 'mcpHandler'
> & {
  /**
   * Authorizes requests to your own handlers and stores the verified `AuthInfo` as `req.auth`.
   * `mcpHandler()` authorizes on its own and does not need it.
   */
  requireAuth(): RequestHandler;
  protectedResourceMetadata(): RequestHandler;
  authorizationServerMetadata(): RequestHandler;
  /**
   * Serves MCP requests. Authorizes each request, then dispatches it to a server built by `factory`.
   */
  mcpHandler(factory: McpServerFactory, options?: CreateMcpHandlerOptions): RequestHandler;
};

// One web request per Express request, so that a request passing through two of these handlers is verified once.
const webRequests = new WeakMap<ExpressRequest, Request>();

function toWebRequest(req: ExpressRequest): Request {
  const known = webRequests.get(req);
  if (known) {
    return known;
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach(entry => headers.append(key, entry));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  const request = new Request(`${req.protocol}://${req.get('host') ?? 'localhost'}${req.originalUrl}`, {
    method: req.method,
    headers,
  });
  webRequests.set(req, request);
  return request;
}

async function send(response: Response, res: ExpressResponse): Promise<void> {
  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(await response.text());
}

/**
 * `createClerkMcpAuth()` with handlers in Express's shape. Needs `@modelcontextprotocol/node`.
 */
export function createClerkMcpAuth<const TTools extends ToolScopeMap = Record<never, never>>(
  options: ClerkMcpAuthOptions<TTools>,
): ClerkMcpExpressAuth<TTools> {
  const core = createCore(options);
  const parseJson = express.json();
  const serve =
    (handler: (request: Request) => Response | Promise<Response>): RequestHandler =>
    (req, res, next) => {
      Promise.resolve(handler(toWebRequest(req)))
        .then(response => send(response, res))
        .catch(next);
    };

  const requireAuth: RequestHandler = (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const authorize = (error?: unknown) => {
      if (error) {
        return next(error);
      }
      core
        .authenticate(toWebRequest(req), { parsedBody: req.body })
        .then(result => {
          if (result instanceof Response) {
            return send(result, res);
          }
          (req as ExpressRequest & { auth?: AuthInfo }).auth = result;
          next();
        })
        .catch(next);
    };
    // The scopes a tool call needs are read from the body, so an unparsed body would skip the scope check.
    if (req.body === undefined) {
      parseJson(req, res, authorize);
    } else {
      authorize();
    }
  };

  return {
    ...core,
    requireAuth: () => requireAuth,
    protectedResourceMetadata: () => serve(core.protectedResourceMetadata()),
    authorizationServerMetadata: () => serve(core.authorizationServerMetadata()),
    mcpHandler: (factory, handlerOptions) => {
      const handler = toNodeHandler(createMcpHandler(factory, handlerOptions));
      return (req, res, next) => {
        requireAuth(req, res, (error?: unknown) => {
          if (error) {
            return next(error);
          }
          handler(req, res, req.body).catch(next);
        });
      };
    },
  };
}
