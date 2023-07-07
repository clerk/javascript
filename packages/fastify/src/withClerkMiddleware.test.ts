import type { FastifyReply, FastifyRequest } from 'fastify';
import Fastify from 'fastify';

import { clerkPlugin, getAuth } from './index';

const authenticateRequestMock = jest.fn();
const localInterstitialMock = jest.fn();

jest.mock('@clerk/backend', () => {
  return {
    ...jest.requireActual('@clerk/backend'),
    Clerk: () => {
      return {
        authenticateRequest: (...args: any) => authenticateRequestMock(...args),
        localInterstitial: (...args: any) => localInterstitialMock(...args),
      };
    },
  };
});

describe('withClerkMiddleware(options)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('handles signin with Authorization Bearer', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: false,
      isSignedIn: true,
      toAuth: () => 'mockedAuth',
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
    expect(response.body).toEqual(JSON.stringify({ auth: 'mockedAuth' }));
    expect(authenticateRequestMock).toBeCalledWith(
      expect.objectContaining({
        secretKey: 'TEST_API_KEY',
        apiKey: 'TEST_API_KEY',
        request: expect.any(Request),
      }),
    );
  });

  test('handles signin with cookie', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: false,
      isSignedIn: true,
      toAuth: () => 'mockedAuth',
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
    expect(response.body).toEqual(JSON.stringify({ auth: 'mockedAuth' }));
    expect(authenticateRequestMock).toBeCalledWith(
      expect.objectContaining({
        secretKey: 'TEST_API_KEY',
        apiKey: 'TEST_API_KEY',
        request: expect.any(Request),
      }),
    );
  });

  test('handles unknown case by terminating the request with empty response and 401 http code', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: true,
      isInterstitial: false,
      isSignedIn: false,
      reason: 'auth-reason',
      message: 'auth-message',
      toAuth: () => 'mockedAuth',
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

    expect(response.statusCode).toEqual(401);
    expect(response.headers['x-clerk-auth-reason']).toEqual('auth-reason');
    expect(response.headers['x-clerk-auth-message']).toEqual('auth-message');
    expect(response.body).toEqual('');
  });

  test('handles interstitial case by terminating the request with interstitial html page and 401 http code', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: true,
      isSignedIn: false,
      reason: 'auth-reason',
      message: 'auth-message',
      toAuth: () => 'mockedAuth',
    });
    localInterstitialMock.mockReturnValue('<html><body>Interstitial</body></html>');
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

    expect(response.statusCode).toEqual(401);
    expect(response.headers['content-type']).toEqual('text/html');
    expect(response.headers['x-clerk-auth-reason']).toEqual('auth-reason');
    expect(response.headers['x-clerk-auth-message']).toEqual('auth-message');
    expect(response.body).toEqual('<html><body>Interstitial</body></html>');
  });

  test('handles signout case by populating the req.auth', async () => {
    authenticateRequestMock.mockResolvedValue({
      isUnknown: false,
      isInterstitial: false,
      isSignedIn: false,
      toAuth: () => 'mockedAuth',
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
    expect(response.body).toEqual(JSON.stringify({ auth: 'mockedAuth' }));
    expect(authenticateRequestMock).toBeCalledWith(
      expect.objectContaining({
        secretKey: 'TEST_API_KEY',
        apiKey: 'TEST_API_KEY',
        request: expect.any(Request),
      }),
    );
  });
});
