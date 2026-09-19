import { McpServer, OAuthError, OAuthErrorCode } from '@modelcontextprotocol/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createClerkMcpAuth } from '../auth';
import { ClerkMcpError } from '../errors';
import type { ClerkMcpTelemetryEvent } from '../telemetry';
import {
  authInfoFor,
  legacyInitialize,
  modernToolCall,
  PUBLISHABLE_KEY,
  RESOURCE,
  RESOURCE_METADATA_URL,
  toolCall,
} from './helpers';

const verifyAccessToken = vi.fn();
const verifier = { verifyAccessToken };
const catalog = ['user:org:read', 'applications:read', 'applications:manage', 'application_secret_keys:read'];
const tools = {
  whoami: ['user:org:read'],
  get_application: ['user:org:read', 'applications:read'],
  create_application: ['user:org:read', 'applications:manage'],
  get_instance_keys: (args: unknown) =>
    typeof args === 'object' && args !== null && (args as { include_secret_key?: boolean }).include_secret_key
      ? ['user:org:read', 'applications:read', 'application_secret_keys:read']
      : ['user:org:read', 'applications:read'],
};
const baselineChallenge = `Bearer scope="user:org:read applications:read", resource_metadata="${RESOURCE_METADATA_URL}"`;

function create(overrides: Record<string, unknown> = {}) {
  return createClerkMcpAuth({
    resource: RESOURCE,
    publishableKey: PUBLISHABLE_KEY,
    verifier,
    scopes: catalog,
    baselineScopes: ['user:org:read', 'applications:read'],
    tools,
    ...overrides,
  });
}

function request(init: { method?: string; headers?: Record<string, string>; body?: unknown } = {}) {
  const hasBody = init.body !== undefined;
  return new Request(RESOURCE, {
    method: init.method ?? (hasBody ? 'POST' : 'GET'),
    headers: { ...(hasBody ? { 'content-type': 'application/json' } : {}), ...init.headers },
    body: hasBody ? JSON.stringify(init.body) : undefined,
  });
}

function bearer(token = 'mcp-access-token') {
  return { authorization: `Bearer ${token}` };
}

describe('createClerkMcpAuth configuration', () => {
  beforeEach(() => {
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('CLERK_SECRET_KEY', '');
    vi.stubEnv('CLERK_JWT_KEY', '');
  });

  it.each([
    ['a relative resource', { resource: '/mcp' }],
    ['a resource with a fragment', { resource: `${RESOURCE}#frag` }],
    ['a resource with a query string', { resource: `${RESOURCE}?x=1` }],
    ['a non-http resource', { resource: 'ftp://example.com/mcp' }],
    ['an invalid scope token', { scopes: ['bad scope'] }],
    ['a baseline scope outside the catalog', { baselineScopes: ['notes:read'] }],
    ['a tool scope outside the catalog', { tools: { list_notes: ['notes:read'] } }],
    ['an unknown insufficient scope mode', { insufficientScope: 'nope' }],
  ])('fails loudly on %s', (_name, overrides) => {
    expect(() => create(overrides)).toThrow(ClerkMcpError);
    expect(() => create(overrides)).toThrow(/^Clerk MCP: /);
  });

  it('accepts an explicit authorization server and a secret key from the environment', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_123');
    const clerkMcp = createClerkMcpAuth({
      resource: RESOURCE,
      authorizationServerUrl: 'https://auth.example.com/',
      scopes: ['notes:read'],
    });

    const metadata = await clerkMcp.protectedResourceMetadata()(new Request(RESOURCE_METADATA_URL)).json();

    expect(metadata.authorization_servers).toEqual(['https://auth.example.com']);
  });

  it('derives the authorization server and the metadata URL from the publishable key and the resource', async () => {
    const clerkMcp = create();

    const challenge = (await clerkMcp.authenticate(request())) as Response;
    const metadata = await clerkMcp.protectedResourceMetadata()(new Request(RESOURCE_METADATA_URL)).json();

    expect(challenge.headers.get('WWW-Authenticate')).toContain(`resource_metadata="${RESOURCE_METADATA_URL}"`);
    expect(metadata).toMatchObject({ resource: RESOURCE, authorization_servers: ['https://clerk.example.com'] });
  });

  it('derives the catalog from the baseline and tool scopes when none is given', async () => {
    const clerkMcp = createClerkMcpAuth({
      resource: RESOURCE,
      publishableKey: PUBLISHABLE_KEY,
      verifier,
      baselineScopes: ['user:org:read'],
      tools: { create: ['applications:manage', 'user:org:read'], read: ['applications:read'] },
    });

    const challenge = (await clerkMcp.authenticate(
      request({ body: [toolCall('read'), toolCall('create', {}, 2)] }),
    )) as Response;

    expect(challenge.headers.get('WWW-Authenticate')).toContain(
      'scope="user:org:read applications:manage applications:read"',
    );
  });

  it('requests every scope at sign-in when no baseline is given', async () => {
    const clerkMcp = create({ baselineScopes: undefined });

    const challenge = (await clerkMcp.authenticate(request())) as Response;

    expect(challenge.headers.get('WWW-Authenticate')).toContain(`scope="${catalog.join(' ')}"`);
  });
});

describe('keys and credentials', () => {
  const metadataRequest = () => new Request(RESOURCE_METADATA_URL);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('CLERK_SECRET_KEY', '');
    vi.stubEnv('CLERK_JWT_KEY', '');
  });

  it('are not needed to construct the server or to challenge an anonymous request', async () => {
    const clerkMcp = createClerkMcpAuth({ resource: RESOURCE, scopes: ['notes:read'] });

    const response = (await clerkMcp.authenticate(request())) as Response;

    expect(response.status).toBe(401);
    expect(response.headers.get('WWW-Authenticate')).toBe(
      `Bearer scope="notes:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
    );
  });

  it.each([
    ['a missing publishable key', undefined],
    ['an invalid publishable key', 'sk_test_nope'],
  ])('fail loudly on %s when the metadata is first served', (_name, publishableKey) => {
    const clerkMcp = createClerkMcpAuth({ resource: RESOURCE, publishableKey, verifier });

    expect(() => clerkMcp.protectedResourceMetadata()(metadataRequest())).toThrow(/^Clerk MCP: /);
  });

  it('fail loudly on a missing secret key when a token is first verified, instead of answering a bare 500', async () => {
    const clerkMcp = createClerkMcpAuth({ resource: RESOURCE, publishableKey: PUBLISHABLE_KEY });

    await expect(clerkMcp.authenticate(request({ headers: bearer() }))).rejects.toMatchObject({
      code: 'configuration',
      message: expect.stringContaining('"secretKey"'),
    });
  });

  it('fail loudly on missing client credentials when a token is first exchanged', async () => {
    const clerkMcp = create({ tokenExchange: { clientId: 'client', clientSecret: '' } });

    await expect(
      clerkMcp.exchangeToken(authInfoFor(), { resource: 'https://api.example.com', scopes: ['applications:read'] }),
    ).rejects.toMatchObject({ code: 'configuration' });
  });

  it('are read from the environment on first use, not at construction', async () => {
    const clerkMcp = createClerkMcpAuth({ resource: RESOURCE, verifier });
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', PUBLISHABLE_KEY);

    const metadata = await clerkMcp.protectedResourceMetadata()(metadataRequest()).json();

    expect(metadata.authorization_servers).toEqual(['https://clerk.example.com']);
  });
});

describe('a resource derived from the request', () => {
  const derived = () => create({ resource: (req: Request) => new URL('/mcp', req.url) });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('binds tokens, challenges and metadata to the origin that was called', async () => {
    const clerkMcp = derived();
    const authInfo = authInfoFor({ resource: new URL('https://mcp.example.dev/mcp') });
    verifyAccessToken.mockResolvedValue(authInfo);

    const accepted = await clerkMcp.authenticate(new Request('https://mcp.example.dev/mcp', { headers: bearer() }));
    const refused = (await clerkMcp.authenticate(new Request(RESOURCE, { headers: bearer() }))) as Response;
    const metadata = await clerkMcp
      .protectedResourceMetadata()(new Request('https://mcp.example.dev/.well-known/oauth-protected-resource/mcp'))
      .json();

    expect(accepted).toBe(authInfo);
    expect(refused.status).toBe(401);
    expect(refused.headers.get('WWW-Authenticate')).toContain(`resource_metadata="${RESOURCE_METADATA_URL}"`);
    expect(metadata.resource).toBe('https://mcp.example.dev/mcp');
  });

  it('fails loudly when the function returns an invalid resource', async () => {
    const clerkMcp = create({ resource: () => '/mcp' });

    await expect(clerkMcp.authenticate(request())).rejects.toMatchObject({ code: 'configuration' });
  });
});

describe('authenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE'])('challenges an anonymous %s request', async method => {
    const response = (await create().authenticate(request({ method }))) as Response;

    expect(response.status).toBe(401);
    expect(response.headers.get('WWW-Authenticate')).toBe(baselineChallenge);
    expect(response.headers.get('Access-Control-Expose-Headers')).toBe('WWW-Authenticate');
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it.each(['Basic credentials', 'Bearer', 'Bearer token with-spaces'])(
    'returns the sign-in challenge for a malformed authorization header: %s',
    async authorization => {
      const response = (await create().authenticate(request({ headers: { authorization } }))) as Response;

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe(baselineChallenge);
      expect(verifyAccessToken).not.toHaveBeenCalled();
    },
  );

  it('attaches verified auth info for a bound token', async () => {
    const authInfo = authInfoFor();
    verifyAccessToken.mockResolvedValue(authInfo);

    await expect(create().authenticate(request({ headers: bearer() }))).resolves.toBe(authInfo);
    expect(verifyAccessToken).toHaveBeenCalledWith('mcp-access-token');
  });

  it('marks an invalid token in the challenge without leaking verifier details', async () => {
    verifyAccessToken.mockRejectedValue(new OAuthError(OAuthErrorCode.InvalidToken, 'jwks kid mismatch'));

    const response = (await create().authenticate(request({ headers: bearer('expired') }))) as Response;

    expect(response.status).toBe(401);
    expect(response.headers.get('WWW-Authenticate')).toBe(
      `Bearer error="invalid_token", error_description="The access token is invalid.", scope="user:org:read applications:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
    );
    expect(await response.text()).not.toContain('kid');
  });

  it.each([
    ['an unexpected verifier failure', new Error('sensitive verifier failure')],
    ['a verifier server error', new OAuthError(OAuthErrorCode.ServerError, 'sensitive backend detail')],
  ])('answers %s with a bare 500', async (_name, error) => {
    verifyAccessToken.mockRejectedValue(error);

    const response = (await create().authenticate(request({ headers: bearer() }))) as Response;

    const text = await response.text();
    expect(response.status).toBe(500);
    expect(JSON.parse(text)).toEqual({ error: 'server_error' });
    expect(text).not.toContain('sensitive');
  });

  it.each([
    ['without an expiration', { expiresAt: undefined }],
    ['with a NaN expiration', { expiresAt: Number.NaN }],
    ['that has expired', { expiresAt: Math.floor(Date.now() / 1000) - 1 }],
  ])('refuses a token %s', async (_name, overrides) => {
    verifyAccessToken.mockResolvedValue(authInfoFor(overrides));

    const response = (await create().authenticate(request({ headers: bearer() }))) as Response;

    expect(response.status).toBe(401);
    expect(response.headers.get('WWW-Authenticate')).toContain('error="invalid_token"');
  });

  describe('audience binding', () => {
    it.each([
      ['an unbound token', { resource: undefined }, 'The access token is not bound to a resource.'],
      [
        'a token bound to another server',
        { resource: new URL('https://other.example.com/mcp') },
        'The access token is bound to another resource.',
      ],
      [
        'a token bound to another path on this origin',
        { resource: new URL('https://example.com/other') },
        'The access token is bound to another resource.',
      ],
    ])('refuses %s even though it verified', async (_name, overrides, description) => {
      verifyAccessToken.mockResolvedValue(authInfoFor(overrides));

      const response = (await create().authenticate(request({ headers: bearer() }))) as Response;

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe(
        `Bearer error="invalid_token", error_description="${description}", scope="user:org:read applications:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
      );
    });

    it('accepts a resource serialized as a string', async () => {
      const authInfo = authInfoFor({ resource: RESOURCE as unknown as URL });
      verifyAccessToken.mockResolvedValue(authInfo);

      await expect(create().authenticate(request({ headers: bearer() }))).resolves.toBe(authInfo);
    });

    it('can accept unbound tokens while still refusing mismatched ones', async () => {
      const clerkMcp = create({ requireResourceBinding: false });
      const unbound = authInfoFor({ resource: undefined });
      verifyAccessToken.mockResolvedValueOnce(unbound);
      verifyAccessToken.mockResolvedValueOnce(authInfoFor({ resource: new URL('https://other.example.com/mcp') }));

      await expect(clerkMcp.authenticate(request({ headers: bearer() }))).resolves.toBe(unbound);
      const refused = (await clerkMcp.authenticate(request({ headers: bearer() }))) as Response;
      expect(refused.status).toBe(401);
    });
  });

  describe('tool scopes', () => {
    it('asks anonymous tool calls for the baseline plus the tool scopes, in catalog order', async () => {
      const clerkMcp = create();

      const single = (await clerkMcp.authenticate(request({ body: toolCall('create_application') }))) as Response;
      const batch = (await clerkMcp.authenticate(
        request({ body: [toolCall('whoami'), toolCall('get_instance_keys', { include_secret_key: true }, 2)] }),
      )) as Response;

      expect(single.headers.get('WWW-Authenticate')).toBe(
        `Bearer scope="user:org:read applications:read applications:manage", resource_metadata="${RESOURCE_METADATA_URL}"`,
      );
      expect(batch.headers.get('WWW-Authenticate')).toBe(
        `Bearer scope="user:org:read applications:read application_secret_keys:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
      );
    });

    it('challenges a valid token that lacks the tool scope for step-up', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));

      const response = (await create().authenticate(
        request({ headers: bearer(), body: toolCall('get_application') }),
      )) as Response;

      expect(response.status).toBe(403);
      expect(response.headers.get('WWW-Authenticate')).toBe(
        `Bearer error="insufficient_scope", error_description="Additional permissions are required for this tool.", scope="user:org:read applications:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
      );
      await expect(response.json()).resolves.toEqual({
        error: 'insufficient_scope',
        error_description: 'Additional permissions are required for this tool.',
      });
    });

    it('keeps what an older token has and adds what the tool needs', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['applications:read'] }));

      const response = (await create().authenticate(
        request({ headers: bearer(), body: toolCall('create_application') }),
      )) as Response;

      expect(response.headers.get('WWW-Authenticate')).toContain(
        'scope="user:org:read applications:read applications:manage"',
      );
    });

    it('resolves argument-dependent scopes from the request body', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor());
      const clerkMcp = create();

      const allowed = await clerkMcp.authenticate(
        request({ headers: bearer(), body: toolCall('get_instance_keys', { include_secret_key: false }) }),
      );
      const stepUp = (await clerkMcp.authenticate(
        request({ headers: bearer(), body: toolCall('get_instance_keys', { include_secret_key: true }) }),
      )) as Response;

      expect(allowed).not.toBeInstanceOf(Response);
      expect(stepUp.status).toBe(403);
      expect(stepUp.headers.get('WWW-Authenticate')).toContain(
        'scope="user:org:read applications:read application_secret_keys:read"',
      );
    });

    it('lets the body decide the scopes of a modern request', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor());
      const { headers, body } = modernToolCall('get_instance_keys', { include_secret_key: true });

      const response = (await create().authenticate(
        new Request(RESOURCE, { method: 'POST', headers: { ...headers, ...bearer() }, body }),
      )) as Response;

      expect(response.status).toBe(403);
      expect(response.headers.get('WWW-Authenticate')).toContain('application_secret_keys:read');
    });

    it('appends scopes outside the catalog to the challenge', async () => {
      const clerkMcp = create({ tools: { ...tools, custom: () => ['custom:write'] } });

      const response = (await clerkMcp.authenticate(request({ body: toolCall('custom') }))) as Response;

      expect(response.headers.get('WWW-Authenticate')).toContain(
        'scope="user:org:read applications:read custom:write"',
      );
    });

    it('prefers a pre-parsed body over reading the request', async () => {
      const clerkMcp = create();

      const response = (await clerkMcp.authenticate(request({ method: 'POST' }), {
        parsedBody: toolCall('create_application'),
      })) as Response;

      expect(response.headers.get('WWW-Authenticate')).toContain('applications:manage');
    });

    it('leaves the request body readable after inspecting it', async () => {
      verifyAccessToken.mockResolvedValue(authInfoFor());
      const req = request({ headers: bearer(), body: toolCall('get_application') });

      await create().authenticate(req);

      await expect(req.json()).resolves.toEqual(toolCall('get_application'));
    });

    it('skips the pre-dispatch check in tool-error mode', async () => {
      const authInfo = authInfoFor({ scopes: ['user:org:read'] });
      verifyAccessToken.mockResolvedValue(authInfo);

      await expect(
        create({ insufficientScope: 'tool-error' }).authenticate(
          request({ headers: bearer(), body: toolCall('get_application') }),
        ),
      ).resolves.toBe(authInfo);
    });
  });

  it('reports every outcome to the telemetry sink and survives a broken sink', async () => {
    const events: ClerkMcpTelemetryEvent[] = [];
    const clerkMcp = create({
      telemetry: (event: ClerkMcpTelemetryEvent) => {
        events.push(event);
        throw new Error('sink failure');
      },
    });
    verifyAccessToken
      .mockRejectedValueOnce(new OAuthError(OAuthErrorCode.InvalidToken, 'nope'))
      .mockResolvedValueOnce(authInfoFor({ resource: undefined }))
      .mockResolvedValueOnce(authInfoFor({ resource: new URL('https://other.example.com/mcp') }))
      .mockResolvedValueOnce(authInfoFor({ scopes: [] }))
      .mockResolvedValueOnce(authInfoFor());

    await clerkMcp.authenticate(request());
    await clerkMcp.authenticate(request({ headers: bearer() }));
    await clerkMcp.authenticate(request({ headers: bearer() }));
    await clerkMcp.authenticate(request({ headers: bearer() }));
    await clerkMcp.authenticate(request({ headers: bearer(), body: toolCall('get_application') }));
    await clerkMcp.authenticate(request({ headers: bearer() }));

    expect(events).toEqual([
      { type: 'auth', success: false, reason: 'authentication_required' },
      { type: 'auth', success: false, reason: 'invalid_token' },
      { type: 'auth', success: false, reason: 'audience_missing' },
      { type: 'auth', success: false, reason: 'audience_mismatch' },
      { type: 'auth', success: false, reason: 'insufficient_scope' },
      { type: 'auth', success: true },
    ]);
  });
});

describe('a request that is authenticated twice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is verified and reported once, and its scopes are still checked once the body is known', async () => {
    const events: ClerkMcpTelemetryEvent[] = [];
    const clerkMcp = create({ telemetry: (event: ClerkMcpTelemetryEvent) => events.push(event) });
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));
    const req = request({ method: 'POST', headers: bearer() });

    const withoutBody = await clerkMcp.authenticate(req);
    const again = await clerkMcp.authenticate(req);
    const withBody = (await clerkMcp.authenticate(req, { parsedBody: toolCall('create_application') })) as Response;

    expect(withoutBody).not.toBeInstanceOf(Response);
    expect(again).toBe(withoutBody);
    expect(withBody.status).toBe(403);
    expect(verifyAccessToken).toHaveBeenCalledOnce();
    expect(events).toEqual([
      { type: 'auth', success: true },
      { type: 'auth', success: false, reason: 'insufficient_scope' },
    ]);
  });
});

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('wraps a handler with the gate', async () => {
    const authInfo = authInfoFor();
    verifyAccessToken.mockResolvedValue(authInfo);
    const handler = vi.fn(() => Promise.resolve(Response.json({ ok: true })));
    const protectedHandler = create().requireAuth(handler);

    const refused = await protectedHandler(request());
    const served = await protectedHandler(request({ headers: bearer() }));

    expect(refused.status).toBe(401);
    expect(served.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(expect.any(Request), authInfo);
  });
});

describe('withScopes', () => {
  const context = (scopes: string[] | undefined) => ({ http: scopes ? { authInfo: authInfoFor({ scopes }) } : {} });

  it('fails loudly for a tool without configured scopes', () => {
    expect(() => create().withScopes('unknown' as never, () => ({ content: [] }))).toThrow(ClerkMcpError);
  });

  it('runs the tool with its arguments when the grant covers it', async () => {
    const events: ClerkMcpTelemetryEvent[] = [];
    const clerkMcp = create({ telemetry: (event: ClerkMcpTelemetryEvent) => events.push(event) });
    const tool = clerkMcp.withScopes('get_application', (args: { id: string }, ctx: unknown) => ({
      content: [{ type: 'text' as const, text: `${args.id}:${(ctx as { tag: string }).tag}` }],
    }));

    const result = await tool({ id: 'app_1' }, { ...context(['user:org:read', 'applications:read']), tag: 'ctx' });

    expect(result).toEqual({ content: [{ type: 'text', text: 'app_1:ctx' }] });
    expect(events).toEqual([{ type: 'tool', tool: 'get_application', durationMs: expect.any(Number), success: true }]);
  });

  it('returns a labeled permission error instead of running the tool', async () => {
    const events: ClerkMcpTelemetryEvent[] = [];
    const clerkMcp = create({
      scopes: [
        'user:org:read',
        'applications:read',
        { scope: 'applications:manage', label: 'Manage applications' },
        'application_secret_keys:read',
      ],
      telemetry: (event: ClerkMcpTelemetryEvent) => events.push(event),
    });
    const callback = vi.fn();
    const tool = clerkMcp.withScopes('create_application', callback);

    const result = await tool({}, context(['user:org:read']));

    expect(result).toEqual({
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Permission denied. This connection is missing: Manage applications (applications:manage). Reconnect to grant access.',
        },
      ],
    });
    expect(callback).not.toHaveBeenCalled();
    expect(events).toEqual([
      {
        type: 'tool',
        tool: 'create_application',
        durationMs: expect.any(Number),
        success: false,
        error: 'insufficient_scope',
      },
    ]);
  });

  it('treats a missing auth context as no grant and reads the context of argument-less tools', async () => {
    const clerkMcp = create();
    const tool = clerkMcp.withScopes('whoami', (ctx: { http?: { authInfo?: { extra?: unknown } } }) => ({
      content: [{ type: 'text' as const, text: JSON.stringify(ctx.http?.authInfo?.extra) }],
    }));

    await expect(tool(context(undefined))).resolves.toMatchObject({ isError: true });
    await expect(tool(context(['user:org:read']))).resolves.toEqual({
      content: [{ type: 'text', text: '{"userId":"user_123"}' }],
    });
  });

  it('records tool errors and rethrows failures without their messages', async () => {
    const events: ClerkMcpTelemetryEvent[] = [];
    const clerkMcp = create({ telemetry: (event: ClerkMcpTelemetryEvent) => events.push(event) });
    const failing = clerkMcp.withScopes('whoami', (_ctx: unknown) => ({ isError: true, content: [] }));
    const throwing = clerkMcp.withScopes('whoami', (_ctx: unknown) => Promise.reject(new TypeError('secret detail')));

    await failing(context(['user:org:read']));
    await expect(throwing(context(['user:org:read']))).rejects.toThrow('secret detail');

    expect(events.map(event => (event.type === 'tool' ? [event.success, event.error] : event))).toEqual([
      [false, undefined],
      [false, 'TypeError'],
    ]);
  });
});

describe('mcpHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createHandler(clerkMcp = create()) {
    const factory = vi.fn(() => {
      const server = new McpServer({ name: 'test-server', version: '1.0.0' });
      server.registerTool(
        'get_application',
        { inputSchema: z.object({ application_id: z.string() }) },
        clerkMcp.withScopes('get_application', (args, ctx) => ({
          content: [{ type: 'text', text: `${args.application_id}:${String(ctx.http?.authInfo?.extra?.userId)}` }],
        })),
      );
      return server;
    });
    return { handler: clerkMcp.mcpHandler(factory), factory };
  }

  it('challenges anonymous requests before constructing a server', async () => {
    const { handler, factory } = createHandler();

    const response = await handler(request({ body: legacyInitialize() }));

    expect(response.status).toBe(401);
    expect(factory).not.toHaveBeenCalled();
  });

  it('serves a legacy initialize exchange for a valid token', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor());
    const { handler } = createHandler();

    const response = await handler(
      request({
        headers: { ...bearer(), accept: 'application/json, text/event-stream' },
        body: legacyInitialize(),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('"protocolVersion":"2025-06-18"');
  });

  it('runs a scoped tool with the verified auth info', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor());
    const { handler } = createHandler();
    const { headers, body } = modernToolCall('get_application', { application_id: 'app_1' });

    const response = await handler(
      new Request(RESOURCE, { method: 'POST', headers: { ...headers, ...bearer() }, body }),
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { result: { content: { text: string }[] } };
    expect(payload.result.content[0]?.text).toBe('app_1:user_123');
  });

  it('refuses a tool call that lacks its scope before dispatch', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));
    const { handler, factory } = createHandler();
    const { headers, body } = modernToolCall('get_application', { application_id: 'app_1' });

    const response = await handler(
      new Request(RESOURCE, { method: 'POST', headers: { ...headers, ...bearer() }, body }),
    );

    expect(response.status).toBe(403);
    expect(factory).not.toHaveBeenCalled();
  });

  it('returns a tool error instead of a challenge in tool-error mode', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));
    const { handler } = createHandler(create({ insufficientScope: 'tool-error' }));
    const { headers, body } = modernToolCall('get_application', { application_id: 'app_1' });

    const response = await handler(
      new Request(RESOURCE, { method: 'POST', headers: { ...headers, ...bearer() }, body }),
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { result: { isError?: boolean; content: { text: string }[] } };
    expect(payload.result.isError).toBe(true);
    expect(payload.result.content[0]?.text).toContain('applications:read');
  });
});

describe('token exchange', () => {
  it('requires configuration', async () => {
    const clerkMcp = create();

    await expect(clerkMcp.exchangeToken(authInfoFor(), { resource: 'https://api.example.com' })).rejects.toMatchObject({
      code: 'configuration',
    });
  });

  it('refuses scopes the MCP token does not carry before calling the token endpoint', async () => {
    const request = vi.fn<typeof fetch>();
    const clerkMcp = create({ tokenExchange: { clientId: 'client', clientSecret: 'secret', fetch: request } });

    await expect(
      clerkMcp.exchangeToken(authInfoFor(), { resource: 'https://api.example.com', scopes: ['applications:manage'] }),
    ).rejects.toMatchObject({ code: 'insufficient_scope' });
    expect(request).not.toHaveBeenCalled();
  });

  it('exchanges the MCP token at the Clerk token endpoint', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: 'upstream-token',
        token_type: 'Bearer',
        issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        expires_in: 300,
        scope: 'applications:read',
      }),
    );
    const clerkMcp = create({ tokenExchange: { clientId: 'client', clientSecret: 'secret', fetch: request } });

    await expect(
      clerkMcp.exchangeToken(authInfoFor(), { resource: 'https://api.example.com', scopes: ['applications:read'] }),
    ).resolves.toMatchObject({ accessToken: 'upstream-token', scope: 'applications:read' });

    const [url, init] = request.mock.calls[0];
    expect(url).toBe('https://clerk.example.com/oauth/token');
    expect((init?.body as URLSearchParams).get('subject_token')).toBe('mcp-access-token');
  });
});

describe('metadata handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('serves protected resource metadata that advertises the baseline scopes', async () => {
    const clerkMcp = create({ metadata: { protectedResource: { resource_name: 'Notes' } } });

    const response = clerkMcp.protectedResourceMetadata()(new Request(RESOURCE_METADATA_URL));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    await expect(response.json()).resolves.toEqual({
      resource: RESOURCE,
      authorization_servers: ['https://clerk.example.com'],
      bearer_methods_supported: ['header'],
      scopes_supported: ['user:org:read', 'applications:read'],
      resource_name: 'Notes',
    });
  });

  it('relays the authorization server metadata and reuses it', async () => {
    const document = {
      issuer: 'https://clerk.example.com',
      registration_endpoint: 'https://clerk.example.com/oauth/register',
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(Response.json(document)));
    const handler = create().authorizationServerMetadata();
    const url = 'https://example.com/.well-known/oauth-authorization-server';

    const first = await handler(new Request(url));
    const second = await handler(new Request(url));

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://clerk.example.com/.well-known/oauth-authorization-server',
    );
    expect(first.headers.get('Access-Control-Allow-Origin')).toBe('*');
    await expect(first.json()).resolves.toEqual(document);
    await expect(second.json()).resolves.toEqual(document);
  });

  it('keeps serving the last document when the authorization server cannot be reached', async () => {
    vi.useFakeTimers();
    const document = { issuer: 'https://clerk.example.com' };
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json(document))
      .mockRejectedValueOnce(new TypeError('network unavailable'));
    const handler = create().authorizationServerMetadata();
    const url = 'https://example.com/.well-known/oauth-authorization-server';

    await handler(new Request(url));
    vi.advanceTimersByTime(3_600_001);
    const stale = await handler(new Request(url));

    expect(stale.status).toBe(200);
    await expect(stale.json()).resolves.toEqual(document);
  });

  it('answers 502 when the authorization server has never been reached', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

    const response = await create().authorizationServerMetadata()(
      new Request('https://example.com/.well-known/oauth-authorization-server'),
    );

    expect(response.status).toBe(502);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
