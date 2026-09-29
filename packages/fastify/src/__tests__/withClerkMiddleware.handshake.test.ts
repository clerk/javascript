import type { AddressInfo } from 'node:net';

import Fastify from 'fastify';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { clerkPlugin } from '../index';
import type { ClerkFastifyOptions } from '../types';

// Runs the real @clerk/backend against a local stand-in for the Backend API.
const PK_LIVE = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';
const PK_TEST = 'pk_test_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

const payloadRequests: string[] = [];
const fakeBackendApi = Fastify();
fakeBackendApi.get('/v1/clients/handshake_payload', (request, reply) => {
  payloadRequests.push(request.url);
  reply.code(404).send({ errors: [{ code: 'resource_not_found', message: 'not found' }] });
});

let apiUrl = '';

beforeAll(async () => {
  await fakeBackendApi.listen({ port: 0, host: '127.0.0.1' });
  apiUrl = `http://127.0.0.1:${(fakeBackendApi.server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await fakeBackendApi.close();
});

afterEach(() => {
  payloadRequests.length = 0;
  vi.restoreAllMocks();
});

const buildApp = async (pluginOptions: Partial<ClerkFastifyOptions>) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const app = Fastify();
  await app.register(clerkPlugin, { apiUrl, ...pluginOptions });
  app.get('/api/me', (_request, reply) => {
    reply.send({
      status: reply.getHeader('x-clerk-auth-status'),
      reason: reply.getHeader('x-clerk-auth-reason'),
    });
  });
  return app;
};

const production = { secretKey: 'sk_live_deadbeef', publishableKey: PK_LIVE };
const development = { secretKey: 'sk_test_deadbeef', publishableKey: PK_TEST };

const fetchHeaders = { 'sec-fetch-dest': 'empty', accept: '*/*' };
const navigationHeaders = { 'sec-fetch-dest': 'document', accept: 'text/html' };

describe('clerkPlugin handshake handling (real @clerk/backend)', () => {
  test('by default a stale nonce on a fetch request is exchanged with the Backend API', async () => {
    const app = await buildApp(production);

    const response = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { ...fetchHeaders, cookie: '__clerk_handshake_nonce=stale; __client_uat=12345' },
    });

    expect(response.statusCode).toBe(200);
    expect(payloadRequests).toHaveLength(1);
    expect(response.json()).toEqual({ status: 'signed-out', reason: 'session-token-missing' });
  });

  test('with __internal_enableHandshake: false a stale nonce on a fetch request is ignored', async () => {
    const app = await buildApp({ ...production, __internal_enableHandshake: false });

    const response = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { ...fetchHeaders, cookie: '__clerk_handshake_nonce=stale; __client_uat=12345' },
    });

    expect(response.statusCode).toBe(200);
    expect(payloadRequests).toHaveLength(0);
    expect(response.json()).toEqual({ status: 'signed-out', reason: 'client-uat-but-no-session-token' });
  });

  test('with __internal_enableHandshake: false a stale nonce on a POST request is ignored', async () => {
    const app = await buildApp({ ...production, __internal_enableHandshake: false });
    app.post('/api/submit', (_request, reply) => {
      reply.send({ status: reply.getHeader('x-clerk-auth-status') });
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/submit',
      headers: { ...navigationHeaders, cookie: '__clerk_handshake_nonce=stale; __client_uat=12345' },
    });

    expect(response.statusCode).toBe(200);
    expect(payloadRequests).toHaveLength(0);
    expect(response.json()).toEqual({ status: 'signed-out' });
  });

  test('with __internal_enableHandshake: false a development navigation still redirects to the dev browser handshake', async () => {
    const app = await buildApp({ ...development, __internal_enableHandshake: false });

    const response = await app.inject({ method: 'GET', url: '/api/me', headers: navigationHeaders });

    expect(response.statusCode).toBe(307);
    expect(response.headers.location).toContain('/v1/client/handshake');
    expect(response.headers['x-clerk-auth-reason']).toBe('dev-browser-missing');
    expect(payloadRequests).toHaveLength(0);
  });

  test('with __internal_enableHandshake: false a development navigation returning from the handshake still resolves the nonce', async () => {
    const app = await buildApp({ ...development, __internal_enableHandshake: false });

    const response = await app.inject({
      method: 'GET',
      url: '/api/me?__clerk_handshake_nonce=fresh',
      headers: navigationHeaders,
    });

    expect(payloadRequests).toHaveLength(1);
    expect(payloadRequests[0]).toContain('nonce=fresh');
    // Development resolution redirects to the same URL with the handshake params removed.
    expect(response.statusCode).toBe(307);
    expect(response.headers.location).not.toContain('__clerk_handshake_nonce');
  });
});
