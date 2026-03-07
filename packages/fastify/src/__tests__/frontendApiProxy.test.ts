import type { FastifyReply, FastifyRequest } from 'fastify';
import Fastify from 'fastify';
import { vi } from 'vitest';

const { mockClerkFrontendApiProxy } = vi.hoisted(() => ({
  mockClerkFrontendApiProxy: vi.fn(),
}));

vi.mock('@clerk/backend/proxy', async () => {
  const actual = await vi.importActual('@clerk/backend/proxy');
  return {
    ...actual,
    clerkFrontendApiProxy: mockClerkFrontendApiProxy,
  };
});

const authenticateRequestMock = vi.fn();

vi.mock('@clerk/backend', async () => {
  const actual = await vi.importActual('@clerk/backend');
  return {
    ...actual,
    createClerkClient: () => {
      return {
        authenticateRequest: (...args: any) => authenticateRequestMock(...args),
      };
    },
  };
});

import { clerkPlugin, getAuth } from '../index';

/**
 * Helper that creates a Fastify instance with clerkPlugin registered, adds a
 * catch-all route, and sends a request to the given path using inject().
 */
async function injectOnPath(
  pluginOptions: Parameters<typeof clerkPlugin>[1],
  path: string,
  headers: Record<string, string> = {},
) {
  const fastify = Fastify();
  await fastify.register(clerkPlugin, pluginOptions);

  fastify.get('/*', (request: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(request);
    reply.send({ auth });
  });

  return fastify.inject({
    method: 'GET',
    path,
    headers,
  });
}

function mockHandshakeResponse() {
  authenticateRequestMock.mockResolvedValueOnce({
    status: 'handshake',
    reason: 'auth-reason',
    message: 'auth-message',
    headers: new Headers({
      location: 'https://fapi.example.com/v1/clients/handshake',
      'x-clerk-auth-message': 'auth-message',
      'x-clerk-auth-reason': 'auth-reason',
      'x-clerk-auth-status': 'handshake',
    }),
    toAuth: () => ({
      tokenType: 'session_token',
    }),
  });
}

describe('Frontend API proxy handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    mockClerkFrontendApiProxy.mockReset();
  });

  it('intercepts proxy path and forwards to clerkFrontendApiProxy', async () => {
    mockClerkFrontendApiProxy.mockResolvedValueOnce(new globalThis.Response('proxied', { status: 200 }));

    const response = await injectOnPath({ frontendApiProxy: { enabled: true } }, '/__clerk/v1/client', {});

    expect(response.statusCode).toEqual(200);
    expect(mockClerkFrontendApiProxy).toHaveBeenCalled();
    expect(authenticateRequestMock).not.toHaveBeenCalled();
  });

  it('intercepts proxy path with query parameters', async () => {
    mockClerkFrontendApiProxy.mockResolvedValueOnce(new globalThis.Response('proxied', { status: 200 }));

    const response = await injectOnPath(
      { frontendApiProxy: { enabled: true } },
      '/__clerk?_clerk_js_version=5.0.0',
      {},
    );

    expect(response.statusCode).toEqual(200);
    expect(mockClerkFrontendApiProxy).toHaveBeenCalled();
    expect(authenticateRequestMock).not.toHaveBeenCalled();
  });

  it('authenticates default path when custom proxy path is set', async () => {
    mockHandshakeResponse();

    const response = await injectOnPath(
      { frontendApiProxy: { enabled: true, path: '/custom-clerk-proxy' } },
      '/__clerk/v1/client',
      {
        Cookie: '__client_uat=1711618859;',
        'Sec-Fetch-Dest': 'document',
      },
    );

    expect(response.statusCode).toEqual(307);
    expect(response.headers).toHaveProperty('x-clerk-auth-status', 'handshake');
    expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
  });

  it('authenticates proxy paths when enabled is false', async () => {
    mockHandshakeResponse();

    const response = await injectOnPath({ frontendApiProxy: { enabled: false } }, '/__clerk/v1/client', {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    });

    expect(response.statusCode).toEqual(307);
    expect(response.headers).toHaveProperty('x-clerk-auth-status', 'handshake');
    expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
  });

  it('does not handle proxy paths when frontendApiProxy is not configured', async () => {
    mockHandshakeResponse();

    const response = await injectOnPath({}, '/__clerk/v1/client', {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    });

    expect(response.statusCode).toEqual(307);
    expect(response.headers).toHaveProperty('x-clerk-auth-status', 'handshake');
    expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
  });

  it('still authenticates requests to other paths when proxy is configured', async () => {
    mockHandshakeResponse();

    const response = await injectOnPath({ frontendApiProxy: { enabled: true } }, '/api/users', {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    });

    expect(response.statusCode).toEqual(307);
    expect(response.headers).toHaveProperty('x-clerk-auth-status', 'handshake');
    expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
  });

  it('auto-derives proxyUrl for authentication when proxy is enabled', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });

    await injectOnPath({ frontendApiProxy: { enabled: true } }, '/api/users', {
      Host: 'myapp.example.com',
    });

    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        proxyUrl: expect.stringContaining('/__clerk'),
      }),
    );
  });
});
