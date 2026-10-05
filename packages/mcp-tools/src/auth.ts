import type {
  AuthInfo,
  CallToolResult,
  CreateMcpHandlerOptions,
  InputRequiredResult,
  McpServerFactory,
  OAuthTokenVerifier,
  ServerContext,
} from '@modelcontextprotocol/server';
import { createMcpHandler, getOAuthProtectedResourceMetadataUrl, OAuthError } from '@modelcontextprotocol/server';

import { ClerkMcpError } from './errors';
import { createTokenExchange, type ExchangedToken, type TokenExchange } from './exchange';
import {
  authorizationServerMetadataHandler,
  clerkAuthorizationServerUrl,
  metadataResponse,
  protectedResourceMetadata,
  trimTrailingSlash,
} from './metadata';
import {
  isScopeToken,
  missingScopes,
  orderScopes,
  requestedToolCalls,
  resolveToolScopes,
  toolScopeLookup,
  type ToolScopeMap,
} from './scopes';
import type { ClerkMcpAuthFailureReason, ClerkMcpTelemetry, ClerkMcpTelemetryEvent } from './telemetry';
import { createClerkOAuthTokenVerifier } from './verifier';

export type ScopeDefinition = string | { scope: string; label?: string };

export type ClerkMcpAuthOptions<TTools extends ToolScopeMap = ToolScopeMap> = {
  /**
   * The absolute URL of your MCP endpoint, for example `https://mcp.example.com/mcp`. Tokens must be issued for it.
   *
   * Pass a function to serve more than one hostname. It runs for every request this package handles, metadata
   * requests included, so derive the resource from the request's origin. The returned URL decides which tokens are
   * accepted: only use a function behind Host header validation.
   */
  resource: string | URL | ((request: Request) => string | URL);
  /**
   * Derives the Clerk authorization server. Like the other keys, it is read on the first request that needs it,
   * so a build step or a test can import your server without it.
   *
   * @default process.env.CLERK_PUBLISHABLE_KEY, then process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   */
  publishableKey?: string;
  /**
   * The authorization server's origin. Replaces the one derived from `publishableKey`.
   */
  authorizationServerUrl?: string;
  /**
   * Verifies tokens. One of `secretKey` and `jwtKey` is required unless you pass a `verifier`.
   *
   * @default process.env.CLERK_SECRET_KEY
   */
  secretKey?: string;
  /**
   * The instance's JWKS public key, for networkless verification of JWT access tokens.
   *
   * @default process.env.CLERK_JWT_KEY
   */
  jwtKey?: string;
  /**
   * The Clerk Backend API origin.
   *
   * @default process.env.CLERK_API_URL
   */
  apiUrl?: string;
  /**
   * The Clerk Backend API version.
   *
   * @default process.env.CLERK_API_VERSION
   */
  apiVersion?: string;
  /**
   * Tolerated clock difference between Clerk and this server, in milliseconds.
   */
  clockSkewInMs?: number;
  /**
   * Every scope this server understands, with optional labels for permission errors. Sets the order of the scopes
   * in challenges. Defaults to the scopes named by `baselineScopes` and `tools`.
   */
  scopes?: readonly ScopeDefinition[];
  /**
   * The scopes requested when a client first signs in, and advertised as `scopes_supported`. Keep it to what basic
   * use needs and let the rest arrive through step-up.
   *
   * @default Every scope in `scopes`.
   */
  baselineScopes?: readonly string[];
  /**
   * The scopes each tool needs, as a list or as a function of the tool's arguments. A tool that is not listed is
   * open to every valid token.
   */
  tools?: TTools;
  /**
   * What a tool call gets when its token lacks a scope: `'challenge'` answers `403 insufficient_scope` before
   * dispatch so the client can step up, `'tool-error'` lets `withScopes()` return a tool error instead.
   *
   * @default 'challenge'
   */
  insufficientScope?: 'challenge' | 'tool-error';
  /**
   * Refuse tokens that carry no audience. Tokens issued for another resource are always refused.
   *
   * @default true
   */
  requireResourceBinding?: boolean;
  /**
   * Replaces Clerk token verification.
   */
  verifier?: OAuthTokenVerifier;
  /**
   * The confidential OAuth client that represents this server at the token endpoint. Enables `exchangeToken()`.
   */
  tokenExchange?: {
    clientId: string;
    clientSecret: string;
    /**
     * @default The authorization server's `/oauth/token`.
     */
    tokenEndpoint?: string | URL;
    fetch?: typeof fetch;
    /**
     * Reuse exchanged tokens until they near expiry. A cached token outlives the revocation of the token it was
     * exchanged for.
     *
     * @default true
     */
    cache?: boolean;
  };
  metadata?: {
    /**
     * Extra RFC 9728 properties for the protected resource metadata document, such as `resource_name`.
     */
    protectedResource?: Record<string, unknown>;
  };
  telemetry?: ClerkMcpTelemetry;
};

export type AuthenticateOptions = {
  /**
   * The JSON body, when a framework has already consumed the request stream.
   */
  parsedBody?: unknown;
};
export type FetchHandler = (request: Request, options?: AuthenticateOptions) => Promise<Response>;
export type AuthenticatedFetchHandler = (request: Request, authInfo: AuthInfo) => Response | Promise<Response>;
export type ToolResult = CallToolResult | InputRequiredResult;
export type ToolHandler<TArgs extends unknown[]> = (...args: TArgs) => ToolResult | Promise<ToolResult>;
export type ScopedToolHandler<TArgs extends unknown[]> = (...args: TArgs) => Promise<ToolResult>;
export type ExchangeTokenOptions = { resource: string | URL; scopes?: readonly string[] };

export type ClerkMcpAuth<TTools extends ToolScopeMap = ToolScopeMap> = {
  /**
   * The token verifier, for use with the MCP SDK's own bearer auth helpers.
   */
  readonly verifier: OAuthTokenVerifier;
  /**
   * Authorizes a request. Resolves to the verified `AuthInfo`, or to the `401` or `403` challenge to send back.
   */
  authenticate(request: Request, options?: AuthenticateOptions): Promise<AuthInfo | Response>;
  /**
   * Wraps a handler so that it only runs for authorized requests.
   */
  requireAuth(handler: AuthenticatedFetchHandler): FetchHandler;
  /**
   * Serves the RFC 9728 protected resource metadata document.
   */
  protectedResourceMetadata(): (request: Request) => Response;
  /**
   * Relays the authorization server's RFC 8414 metadata, for clients that look for it on the MCP server's origin.
   */
  authorizationServerMetadata(): (request: Request) => Promise<Response>;
  /**
   * Serves MCP requests. Authorizes each request, then dispatches it to a server built by `factory`.
   */
  mcpHandler(factory: McpServerFactory, options?: CreateMcpHandlerOptions): FetchHandler;
  /**
   * Guards a tool callback with the scopes configured for `name` and reports the call to `telemetry`.
   */
  withScopes<K extends keyof TTools & string, TArgs extends unknown[]>(
    name: K,
    callback: ToolHandler<TArgs>,
  ): ScopedToolHandler<TArgs>;
  /**
   * Exchanges the caller's token for one scoped to a downstream API (RFC 8693). Never forward the caller's own token.
   */
  exchangeToken(authInfo: AuthInfo, options: ExchangeTokenOptions): Promise<ExchangedToken>;
};

type ScopeCatalog = { scopes: string[]; labels: Record<string, string> };

function envValue(name: string): string | undefined {
  const value = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  return value || undefined;
}

function once<T extends object | string>(create: () => T): () => T {
  let value: T | undefined;
  return () => (value ??= create());
}

function configurationError(message: string): ClerkMcpError {
  return new ClerkMcpError('configuration', `Clerk MCP: ${message}`);
}

function parseResource(resource: string | URL): URL {
  let url: URL;
  try {
    url = new URL(resource);
  } catch {
    throw configurationError(
      '"resource" must be the absolute URL of this MCP server, for example https://mcp.example.com/mcp.',
    );
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw configurationError('"resource" must use the https or http scheme.');
  }
  if (url.hash || url.href.endsWith('#')) {
    throw configurationError('"resource" must not include a fragment.');
  }
  if (url.search) {
    throw configurationError('"resource" must not include a query string.');
  }
  return url;
}

function assertScopes(source: string, scopes: Iterable<string>): void {
  for (const scope of scopes) {
    if (typeof scope !== 'string' || !isScopeToken(scope)) {
      throw configurationError(`${source} contains an invalid OAuth scope: ${JSON.stringify(scope)}.`);
    }
  }
}

function parseCatalog(definitions: readonly ScopeDefinition[] | undefined, fallback: Iterable<string>): ScopeCatalog {
  const catalog: ScopeCatalog = { scopes: [], labels: {} };
  const entries = definitions ?? [...fallback].map(scope => ({ scope }));
  for (const definition of entries) {
    const entry: { scope: string; label?: string } =
      typeof definition === 'string' ? { scope: definition } : definition;
    assertScopes('"scopes"', [entry.scope]);
    if (!catalog.scopes.includes(entry.scope)) {
      catalog.scopes.push(entry.scope);
    }
    if (entry.label) {
      catalog.labels[entry.scope] = entry.label;
    }
  }
  return catalog;
}

function staticToolScopes(tools: ToolScopeMap): string[] {
  return Object.values(tools).flatMap(scopes => (typeof scopes === 'function' ? [] : [...scopes]));
}

function assertCovered(source: string, catalog: readonly string[], scopes: readonly string[]): void {
  const unknown = scopes.filter(scope => !catalog.includes(scope));
  if (unknown.length) {
    throw configurationError(`${source} references scopes that are not in "scopes": ${unknown.join(', ')}.`);
  }
}

function headerValue(value: string): string {
  return value.replace(/["\\]/g, character => `\\${character}`);
}

function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type') ?? '';
  return request.method === 'POST' && /^application\/json\b/i.test(contentType.trim());
}

async function readJsonBody(request: Request): Promise<unknown> {
  if (!isJsonRequest(request) || request.bodyUsed) {
    return undefined;
  }
  try {
    return await request.clone().json();
  } catch {
    return undefined;
  }
}

function resourceHref(value: unknown): string | undefined {
  if (value instanceof URL) {
    return value.href;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  try {
    return new URL(value).href;
  } catch {
    return undefined;
  }
}

/**
 * Turns an MCP server built on the MCP TypeScript SDK v2 into an OAuth 2.0 resource server protected by Clerk.
 *
 * @example
 * ```ts
 * const clerkMcp = createClerkMcpAuth({
 *   resource: 'https://mcp.example.com/mcp',
 *   baselineScopes: ['notes:read'],
 *   tools: { list_notes: ['notes:read'], create_note: ['notes:write'] },
 * });
 *
 * export default { fetch: clerkMcp.mcpHandler(createServer) };
 * ```
 */
export function createClerkMcpAuth<const TTools extends ToolScopeMap = Record<never, never>>(
  options: ClerkMcpAuthOptions<TTools>,
): ClerkMcpAuth<TTools> {
  let resourceFor: (request: Request) => URL;
  if (typeof options.resource === 'function') {
    const resolve = options.resource;
    resourceFor = request => parseResource(resolve(request));
  } else {
    const resource = parseResource(options.resource);
    resourceFor = () => resource;
  }

  const tools = (options.tools ?? {}) as TTools;
  const toolScopes = toolScopeLookup(tools);
  const mode = options.insufficientScope ?? 'challenge';
  if (mode !== 'challenge' && mode !== 'tool-error') {
    throw configurationError(
      `"insufficientScope" must be "challenge" or "tool-error", received ${JSON.stringify(mode)}.`,
    );
  }

  const catalog = parseCatalog(options.scopes, [...(options.baselineScopes ?? []), ...staticToolScopes(tools)]);
  const baselineScopes = [...(options.baselineScopes ?? catalog.scopes)];
  assertScopes('"baselineScopes"', baselineScopes);
  assertCovered('"baselineScopes"', catalog.scopes, baselineScopes);
  for (const [name, scopes] of Object.entries(tools)) {
    if (typeof scopes !== 'function') {
      assertScopes(`"tools.${name}"`, scopes);
      assertCovered(`"tools.${name}"`, catalog.scopes, scopes);
    }
  }

  const requireResourceBinding = options.requireResourceBinding ?? true;

  // Keys and credentials are resolved on first use. Builds and tests import a server without them, and other
  // Clerk SDKs report a missing key on the request that needs it too.
  const authorizationServerUrl = once(() => {
    const publishableKey =
      options.publishableKey ?? envValue('CLERK_PUBLISHABLE_KEY') ?? envValue('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    if (!options.authorizationServerUrl && !publishableKey) {
      throw configurationError(
        'missing "publishableKey". Pass it to createClerkMcpAuth() or set CLERK_PUBLISHABLE_KEY.',
      );
    }
    return trimTrailingSlash(options.authorizationServerUrl ?? clerkAuthorizationServerUrl(publishableKey as string));
  });
  const clerkVerifier = once(() => {
    const secretKey = options.secretKey ?? envValue('CLERK_SECRET_KEY');
    const jwtKey = options.jwtKey ?? envValue('CLERK_JWT_KEY');
    if (!secretKey && !jwtKey) {
      throw configurationError('missing "secretKey". Pass it to createClerkMcpAuth() or set CLERK_SECRET_KEY.');
    }
    return createClerkOAuthTokenVerifier({
      secretKey,
      jwtKey,
      apiUrl: options.apiUrl ?? envValue('CLERK_API_URL'),
      apiVersion: options.apiVersion ?? envValue('CLERK_API_VERSION'),
      clockSkewInMs: options.clockSkewInMs,
    });
  });
  const verifier: OAuthTokenVerifier = options.verifier ?? {
    verifyAccessToken: async token => clerkVerifier().verifyAccessToken(token),
  };

  const emit = (event: ClerkMcpTelemetryEvent): void => {
    try {
      options.telemetry?.(event);
    } catch {
      return;
    }
  };

  const exchange = once((): TokenExchange => {
    if (!options.tokenExchange) {
      throw configurationError('token exchange is not configured. Pass "tokenExchange" to createClerkMcpAuth().');
    }
    return createTokenExchange({
      tokenEndpoint: options.tokenExchange.tokenEndpoint ?? `${authorizationServerUrl()}/oauth/token`,
      clientId: options.tokenExchange.clientId,
      clientSecret: options.tokenExchange.clientSecret,
      fetch: options.tokenExchange.fetch,
      cache: options.tokenExchange.cache,
      telemetry: emit,
    });
  });

  function challenge(
    status: 401 | 403,
    resource: URL,
    scopes: readonly string[],
    error?: 'invalid_token' | 'insufficient_scope',
    description?: string,
  ): Response {
    const parts: string[] = [];
    if (error) {
      parts.push(`error="${error}"`);
    }
    if (description) {
      parts.push(`error_description="${headerValue(description)}"`);
    }
    if (scopes.length) {
      parts.push(`scope="${scopes.join(' ')}"`);
    }
    parts.push(`resource_metadata="${getOAuthProtectedResourceMetadataUrl(resource)}"`);
    return Response.json(
      { error: error ?? 'unauthorized', ...(description ? { error_description: description } : {}) },
      {
        status,
        headers: {
          'WWW-Authenticate': `Bearer ${parts.join(', ')}`,
          // Browser clients can only read the challenge from a cross-origin response when it is exposed.
          'Access-Control-Expose-Headers': 'WWW-Authenticate',
        },
      },
    );
  }

  function refuse(reason: ClerkMcpAuthFailureReason, response: Response): Response {
    emit({ type: 'auth', success: false, reason });
    return response;
  }

  // `requireAuth()` mounted in front of `mcpHandler()` is how 0.x was wired. Such a request is verified once, and
  // every other check still runs on both passes because only the second one may know the body.
  const verified = new WeakMap<Request, AuthInfo>();

  async function authenticate(
    request: Request,
    { parsedBody }: AuthenticateOptions = {},
  ): Promise<AuthInfo | Response> {
    const resource = resourceFor(request);
    const body = parsedBody === undefined ? await readJsonBody(request) : parsedBody;
    const required = orderScopes(
      catalog.scopes,
      requestedToolCalls(request, body).flatMap(call => resolveToolScopes(toolScopes, call.name, call.arguments)),
    );
    const signInScopes = orderScopes(catalog.scopes, [...baselineScopes, ...required]);
    const invalidToken = (description: string) => challenge(401, resource, signInScopes, 'invalid_token', description);

    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return refuse('authentication_required', challenge(401, resource, signInScopes));
    }
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) {
      return refuse('malformed_bearer', challenge(401, resource, signInScopes));
    }

    const alreadyVerified = verified.get(request);
    let authInfo: AuthInfo;
    try {
      authInfo = alreadyVerified ?? (await verifier.verifyAccessToken(match[1]));
    } catch (error) {
      if (error instanceof ClerkMcpError && error.code === 'configuration') {
        throw error;
      }
      if (OAuthError.isInstance(error) && error.code === 'invalid_token') {
        return refuse('invalid_token', invalidToken('The access token is invalid.'));
      }
      return refuse('verification_error', Response.json({ error: 'server_error' }, { status: 500 }));
    }

    if (typeof authInfo.expiresAt !== 'number' || Number.isNaN(authInfo.expiresAt)) {
      return refuse('missing_expiration', invalidToken('The access token has no expiration.'));
    }
    if (authInfo.expiresAt < Date.now() / 1000) {
      return refuse('expired', invalidToken('The access token has expired.'));
    }
    const boundTo = resourceHref(authInfo.resource);
    if (boundTo === undefined && requireResourceBinding) {
      return refuse('audience_missing', invalidToken('The access token is not bound to a resource.'));
    }
    if (boundTo !== undefined && boundTo !== resource.href) {
      return refuse('audience_mismatch', invalidToken('The access token is bound to another resource.'));
    }
    if (mode === 'challenge' && missingScopes(authInfo.scopes, required).length) {
      return refuse(
        'insufficient_scope',
        challenge(
          403,
          resource,
          orderScopes(catalog.scopes, [...authInfo.scopes, ...required]),
          'insufficient_scope',
          'Additional permissions are required for this tool.',
        ),
      );
    }

    if (!alreadyVerified) {
      emit({ type: 'auth', success: true });
      verified.set(request, authInfo);
    }
    return authInfo;
  }

  function permissionDenied(missing: readonly string[]): CallToolResult {
    const permissions = missing.map(scope => (catalog.labels[scope] ? `${catalog.labels[scope]} (${scope})` : scope));
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Permission denied. This connection is missing: ${permissions.join(', ')}. Reconnect to grant access.`,
        },
      ],
    };
  }

  function withScopes<K extends keyof TTools & string, TArgs extends unknown[]>(
    name: K,
    callback: ToolHandler<TArgs>,
  ): ScopedToolHandler<TArgs> {
    if (!toolScopes.has(name)) {
      throw configurationError(`no scopes are configured for tool "${name}". Add it to the "tools" option.`);
    }
    return async (...args: TArgs) => {
      const start = Date.now();
      // The SDK calls a tool with (args, ctx) when it has an input schema and with (ctx) when it has none.
      const context = args[args.length - 1] as ServerContext | undefined;
      const toolArgs = args.length > 1 ? args[0] : undefined;
      const granted = context?.http?.authInfo?.scopes ?? [];
      const missing = missingScopes(granted, resolveToolScopes(toolScopes, name, toolArgs));
      if (missing.length) {
        emit({ type: 'tool', tool: name, durationMs: Date.now() - start, success: false, error: 'insufficient_scope' });
        return permissionDenied(missing);
      }
      try {
        const result = await callback(...args);
        const failed =
          typeof result === 'object' && result !== null && (result as { isError?: unknown }).isError === true;
        emit({ type: 'tool', tool: name, durationMs: Date.now() - start, success: !failed });
        return result;
      } catch (error) {
        emit({
          type: 'tool',
          tool: name,
          durationMs: Date.now() - start,
          success: false,
          error: error instanceof Error ? error.name : 'Error',
        });
        throw error;
      }
    };
  }

  return {
    verifier,
    authenticate,
    requireAuth: handler => async (request, authenticateOptions) => {
      const result = await authenticate(request, authenticateOptions);
      return result instanceof Response ? result : handler(request, result);
    },
    protectedResourceMetadata: () => request =>
      metadataResponse(
        request,
        protectedResourceMetadata({
          authorizationServerUrl: authorizationServerUrl(),
          resource: resourceFor(request),
          scopesSupported: baselineScopes,
          properties: options.metadata?.protectedResource,
        }),
      ),
    authorizationServerMetadata: () => authorizationServerMetadataHandler(authorizationServerUrl),
    mcpHandler: (factory, handlerOptions) => {
      const handler = createMcpHandler(factory, handlerOptions);
      return async (request, authenticateOptions) => {
        const parsedBody = authenticateOptions?.parsedBody ?? (await readJsonBody(request));
        const result = await authenticate(request, { parsedBody });
        return result instanceof Response ? result : handler.fetch(request, { authInfo: result, parsedBody });
      };
    },
    withScopes,
    exchangeToken: async (authInfo, { resource, scopes = [] }) => {
      const requested = [...new Set(scopes)];
      const missing = missingScopes(authInfo.scopes, requested);
      if (missing.length) {
        throw new ClerkMcpError('insufficient_scope', `The access token does not include: ${missing.join(' ')}.`);
      }
      return exchange()({ subjectToken: authInfo.token, resource, scopes: requested });
    },
  };
}
