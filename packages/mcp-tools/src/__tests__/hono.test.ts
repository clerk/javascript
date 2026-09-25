import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { McpServer } from '@modelcontextprotocol/server';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createClerkMcpAuth } from '../hono';
import { authInfoFor, legacyInitialize, PUBLISHABLE_KEY, RESOURCE, RESOURCE_METADATA_URL, toolCall } from './helpers';

const verifyAccessToken = vi.fn();

function create() {
  return createClerkMcpAuth({
    resource: RESOURCE,
    publishableKey: PUBLISHABLE_KEY,
    verifier: { verifyAccessToken },
    scopes: ['user:org:read', 'applications:read', 'applications:manage'],
    baselineScopes: ['user:org:read'],
    tools: { get_application: ['applications:read'], create_application: ['applications:manage'] },
  });
}

function app(clerkMcp = create()) {
  const hono = new Hono();
  hono.get('/.well-known/oauth-protected-resource/mcp', clerkMcp.protectedResourceMetadata());
  hono.get('/.well-known/oauth-authorization-server', clerkMcp.authorizationServerMetadata());
  hono.use('/mcp', async (c, next) => {
    if (c.req.method === 'POST') {
      c.set('parsedBody', await c.req.raw.clone().json());
    }
    return next();
  });
  hono.use('/mcp', clerkMcp.requireAuth());
  hono.all('/mcp', c => c.json({ authInfo: c.get('authInfo') ?? null }));
  return hono;
}

describe('@clerk/mcp-tools/hono', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('challenges anonymous requests and skips preflight', async () => {
    const hono = app();

    const refused = await hono.request(RESOURCE);
    const preflight = await hono.request(RESOURCE, { method: 'OPTIONS' });

    expect(refused.status).toBe(401);
    expect(refused.headers.get('WWW-Authenticate')).toBe(
      `Bearer scope="user:org:read", resource_metadata="${RESOURCE_METADATA_URL}"`,
    );
    expect(preflight.status).toBe(200);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it('stores verified auth info on the context', async () => {
    const authInfo = authInfoFor();
    verifyAccessToken.mockResolvedValue(authInfo);

    const response = await app().request(RESOURCE, { headers: { Authorization: 'Bearer mcp-access-token' } });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authInfo: { ...authInfo, resource: RESOURCE } });
  });

  it('uses the parsed body from the context for step-up', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read'] }));

    const response = await app().request(RESOURCE, {
      method: 'POST',
      headers: { Authorization: 'Bearer mcp-access-token', 'Content-Type': 'application/json' },
      body: JSON.stringify(toolCall('create_application')),
    });

    expect(response.status).toBe(403);
    expect(response.headers.get('WWW-Authenticate')).toContain('scope="user:org:read applications:manage"');
  });

  it('verifies a request once when requireAuth() sits in front of mcpHandler()', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor());
    const clerkMcp = create();
    const hono = new Hono();
    hono.use('/mcp', clerkMcp.requireAuth());
    hono.all(
      '/mcp',
      clerkMcp.mcpHandler(() => new McpServer({ name: 'test-server', version: '1.0.0' })),
    );

    const response = await hono.request(RESOURCE, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mcp-access-token',
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(legacyInitialize()),
    });

    expect(response.status).toBe(200);
    expect(verifyAccessToken).toHaveBeenCalledOnce();
  });

  it('serves both discovery documents', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ issuer: 'https://clerk.example.com' }));
    const hono = app();

    const resource = await hono.request('https://example.com/.well-known/oauth-protected-resource/mcp');
    const server = await hono.request('https://example.com/.well-known/oauth-authorization-server');

    expect((await resource.json()).resource).toBe(RESOURCE);
    expect((await server.json()).issuer).toBe('https://clerk.example.com');
  });

  it('serves an MCP client end to end with scoped tools', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor({ scopes: ['user:org:read', 'applications:read'] }));
    const clerkMcp = create();
    const hono = new Hono();
    hono.all(
      '/mcp',
      clerkMcp.mcpHandler(() => {
        const server = new McpServer({ name: 'test-server', version: '1.0.0' });
        server.registerTool(
          'get_application',
          { inputSchema: z.object({ application_id: z.string() }) },
          clerkMcp.withScopes('get_application', args => ({
            content: [{ type: 'text', text: args.application_id }],
          })),
        );
        server.registerTool(
          'create_application',
          { inputSchema: z.object({}) },
          clerkMcp.withScopes('create_application', () => ({ content: [{ type: 'text', text: 'created' }] })),
        );
        return server;
      }),
    );
    const client = new Client({ name: 'test-client', version: '1.0.0' }, { versionNegotiation: { mode: 'auto' } });
    const transport = new StreamableHTTPClientTransport(new URL(RESOURCE), {
      fetch: (input, init) =>
        Promise.resolve(
          hono.request(input, {
            ...init,
            headers: { ...Object.fromEntries(new Headers(init?.headers)), Authorization: 'Bearer mcp-access-token' },
          }),
        ),
    });

    const anonymous = await hono.request(RESOURCE, { method: 'POST', body: '{}' });
    await client.connect(transport);
    const allowed = await client.callTool({ name: 'get_application', arguments: { application_id: 'app_1' } });
    const refused = client.callTool({ name: 'create_application', arguments: {} });

    expect(anonymous.status).toBe(401);
    expect(client.getProtocolEra()).toBe('modern');
    expect(allowed.content).toEqual([{ type: 'text', text: 'app_1' }]);
    await expect(refused).rejects.toThrow();
    await client.close();
  });
});
