import type { FastifyReply, FastifyRequest } from 'fastify';
import Fastify from 'fastify';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { clerkPlugin, getAuth } from '../index';

const { authenticateRequestMock, createClerkClientMock, mockClerkClient } = vi.hoisted(() => {
  const authenticateRequestMock = vi.fn();
  const mockClerkClient = {
    authenticateRequest: (...args: any) => authenticateRequestMock(...args),
  };
  const createClerkClientMock = vi.fn(() => mockClerkClient);

  return { authenticateRequestMock, createClerkClientMock, mockClerkClient };
});

vi.mock('@clerk/backend', async () => {
  const actual = await vi.importActual('@clerk/backend');
  return {
    ...actual,
    createClerkClient: (...args: any[]) => createClerkClientMock(...args),
  };
});

describe('withClerkMiddleware(options)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('creates the request client with plugin runtime keys', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, {
      secretKey: 'runtime_secret_key',
      publishableKey: 'runtime_publishable_key',
    });

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuth(request);
      reply.send({ auth });
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
    });

    expect(response.statusCode).toEqual(200);
    expect(createClerkClientMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        secretKey: 'runtime_secret_key',
        publishableKey: 'runtime_publishable_key',
      }),
    );
  });

  test('creates the request client with an apiUrl derived from the runtime publishable key', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, {
      secretKey: 'runtime_secret_key',
      publishableKey: 'pk_test_aW1tdW5lLWhhd2stNjUuY2xlcmsuYWNjb3VudHNzdGFnZS5kZXYk',
    });

    fastify.get('/', (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({});
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
    });

    expect(response.statusCode).toEqual(200);
    expect(createClerkClientMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        apiUrl: 'https://api.clerkstage.dev',
        publishableKey: 'pk_test_aW1tdW5lLWhhd2stNjUuY2xlcmsuYWNjb3VudHNzdGFnZS5kZXYk',
      }),
    );
  });

  test('handles signin with Authorization Bearer', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin);

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuth(request);
      reply.send({ auth });
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: {
        Authorization: 'Bearer deadbeef',
        Origin: 'http://origin.com',
        Host: 'host.com',
        'X-Forwarded-Port': '1234',
        'X-Forwarded-Host': 'forwarded-host.com',
        Referer: 'referer.com',
        'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify({ auth: { tokenType: 'session_token' } }));
    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: 'TEST_SECRET_KEY',
      }),
    );
  });

  test('handles signin with cookie', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin);

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuth(request);
      reply.send({ auth });
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: {
        cookie: '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
        Origin: 'http://origin.com',
        Host: 'host.com',
        'X-Forwarded-Port': '1234',
        'X-Forwarded-Host': 'forwarded-host.com',
        Referer: 'referer.com',
        'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify({ auth: { tokenType: 'session_token' } }));
    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: 'TEST_SECRET_KEY',
      }),
    );
  });

  test('handles handshake case by redirecting the request to fapi', async () => {
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
    const fastify = Fastify();
    await fastify.register(clerkPlugin);

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuth(request);
      reply.send({ auth });
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: {
        cookie: '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
      },
    });

    expect(response.statusCode).toEqual(307);
    expect(response.headers).toMatchObject({
      location: 'https://fapi.example.com/v1/clients/handshake',
      'x-clerk-auth-status': 'handshake',
      'x-clerk-auth-reason': 'auth-reason',
      'x-clerk-auth-message': 'auth-message',
    });
  });

  test('skips handshake redirect when enableHandshake is false', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: 'handshake',
      headers: new Headers({
        location: 'https://fapi.example.com/v1/clients/handshake',
        'x-clerk-auth-status': 'handshake',
      }),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, { enableHandshake: false });

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuth(request);
      reply.send({ auth });
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: {
        cookie: '__clerk_handshake_nonce=deadbeef; __client_uat=1675692233',
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify({ auth: { tokenType: 'session_token' } }));
  });

  test('still redirects for dev-browser-missing handshake even when enableHandshake is false', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: 'handshake',
      reason: 'dev-browser-missing',
      headers: new Headers({
        location: 'https://fapi.example.com/v1/clients/handshake',
        'x-clerk-auth-status': 'handshake',
        'x-clerk-auth-reason': 'dev-browser-missing',
      }),
      toAuth: () => ({ tokenType: 'session_token' }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, { enableHandshake: false });

    fastify.get('/', (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({});
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: { cookie: '__client_uat=1675692233' },
    });

    expect(response.statusCode).toEqual(307);
    expect(response.headers.location).toEqual('https://fapi.example.com/v1/clients/handshake');
  });

  test('still redirects for dev-browser-sync handshake even when enableHandshake is false', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: 'handshake',
      reason: 'dev-browser-sync',
      headers: new Headers({
        location: 'https://fapi.example.com/v1/clients/handshake',
        'x-clerk-auth-status': 'handshake',
        'x-clerk-auth-reason': 'dev-browser-sync',
      }),
      toAuth: () => ({ tokenType: 'session_token' }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, { enableHandshake: false });

    fastify.get('/', (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({});
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: { cookie: '__client_uat=1675692233' },
    });

    expect(response.statusCode).toEqual(307);
    expect(response.headers.location).toEqual('https://fapi.example.com/v1/clients/handshake');
  });

  test('strips handshake cookies and query params before authenticating when enableHandshake is false', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({ tokenType: 'session_token' }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, { enableHandshake: false });

    fastify.get('/', (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({});
    });

    await fastify.inject({
      method: 'GET',
      path: '/?__clerk_handshake=token123&__clerk_handshake_nonce=nonce456&foo=bar',
      headers: {
        cookie: '__clerk_handshake=token123; __clerk_handshake_nonce=nonce456; __client_uat=1675692233',
      },
    });

    const [req] = authenticateRequestMock.mock.calls[0];
    expect(new URL(req.url).searchParams.has('__clerk_handshake')).toBe(false);
    expect(new URL(req.url).searchParams.has('__clerk_handshake_nonce')).toBe(false);
    expect(new URL(req.url).searchParams.get('foo')).toBe('bar');
    expect(req.headers.get('cookie')).not.toContain('__clerk_handshake=');
    expect(req.headers.get('cookie')).not.toContain('__clerk_handshake_nonce=');
    expect(req.headers.get('cookie')).toContain('__client_uat=1675692233');
  });

  test('exposes the runtime key clerk client instance on request.clerk', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin, {
      secretKey: 'runtime_secret_key',
      publishableKey: 'runtime_publishable_key',
    });

    let clerkOnRequest: unknown;
    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      clerkOnRequest = request.clerk;
      reply.send({});
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
    });

    expect(response.statusCode).toEqual(200);
    expect(clerkOnRequest).toBe(mockClerkClient);
    expect(createClerkClientMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        secretKey: 'runtime_secret_key',
        publishableKey: 'runtime_publishable_key',
      }),
    );
  });

  test('handles signout case by populating the req.auth', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'session_token',
      }),
    });
    const fastify = Fastify();
    await fastify.register(clerkPlugin);

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const auth = getAuth(request);
      reply.send({ auth });
    });

    const response = await fastify.inject({
      method: 'GET',
      path: '/',
      headers: { Authorization: 'Bearer deadbeef' },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify({ auth: { tokenType: 'session_token' } }));
    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: 'TEST_SECRET_KEY',
      }),
    );
  });
});
