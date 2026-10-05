import { McpServer } from '@modelcontextprotocol/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createClerkMcpAuth } from '../next';
import { authInfoFor, legacyInitialize, PUBLISHABLE_KEY, RESOURCE } from './helpers';

const verifyAccessToken = vi.fn();

function create(publishableKey: string | undefined = PUBLISHABLE_KEY) {
  return createClerkMcpAuth({
    resource: RESOURCE,
    publishableKey,
    verifier: { verifyAccessToken },
    scopes: ['user:org:read'],
  });
}

describe('@clerk/mcp-tools/next', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('gates a route handler and exposes auth info on the request', async () => {
    const authInfo = authInfoFor();
    verifyAccessToken.mockResolvedValue(authInfo);
    const handler = vi.fn((request: Request) =>
      Promise.resolve(Response.json({ auth: (request as Request & { auth?: unknown }).auth ?? null })),
    );
    const GET = create().requireAuth(handler);

    const refused = await GET(new Request(RESOURCE));
    const served = await GET(new Request(RESOURCE, { headers: { Authorization: 'Bearer mcp-access-token' } }));

    expect(refused.status).toBe(401);
    expect(handler).toHaveBeenCalledOnce();
    await expect(served.json()).resolves.toEqual({ auth: { ...authInfo, resource: RESOURCE } });
  });

  it('reads the publishable key from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', PUBLISHABLE_KEY);

    const metadata = await create(undefined)
      .protectedResourceMetadata()(new Request('https://example.com/.well-known/oauth-protected-resource/mcp'))
      .json();

    expect(metadata.authorization_servers).toEqual(['https://clerk.example.com']);
  });

  it('serves MCP route handlers', async () => {
    verifyAccessToken.mockResolvedValue(authInfoFor());
    const POST = create().mcpHandler(() => new McpServer({ name: 'test-server', version: '1.0.0' }));

    const response = await POST(
      new Request(RESOURCE, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mcp-access-token',
          Accept: 'application/json, text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(legacyInitialize()),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('"protocolVersion":"2025-06-18"');
  });
});
