import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createClerkClient } from '@clerk/backend';
import express from 'express';
import supertest from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { clerkMiddleware } from '../clerkMiddleware';

// Nothing is mocked here: the real @clerk/backend runs behind the unchanged express middleware,
// which has no handshake-stripping logic of its own. A local HTTP server stands in for the
// Backend API so the test can observe whether the SDK performs the handshake payload exchange.
const PK_LIVE = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

const payloadRequests: string[] = [];
let fakeBackendApi: Server;
let apiUrl = '';

beforeAll(async () => {
  fakeBackendApi = createServer((request, response) => {
    if (request.url?.startsWith('/v1/clients/handshake_payload')) {
      payloadRequests.push(request.url);
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ errors: [{ code: 'resource_not_found', message: 'not found' }] }));
      return;
    }
    response.writeHead(404).end();
  });
  await new Promise<void>(resolve => fakeBackendApi.listen(0, '127.0.0.1', resolve));
  apiUrl = `http://127.0.0.1:${(fakeBackendApi.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => fakeBackendApi.close(() => resolve()));
});

afterEach(() => {
  payloadRequests.length = 0;
  vi.restoreAllMocks();
});

const buildApp = (middlewareOptions: Record<string, unknown> = {}) => {
  const clerkClient = createClerkClient({ secretKey: 'sk_live_deadbeef', publishableKey: PK_LIVE, apiUrl });
  const app = express();
  app.use(
    clerkMiddleware({ clerkClient, secretKey: 'sk_live_deadbeef', publishableKey: PK_LIVE, ...middlewareOptions }),
  );
  app.get('/api/me', (_request, response) => {
    response.json({
      status: response.getHeader('x-clerk-auth-status'),
      reason: response.getHeader('x-clerk-auth-reason'),
    });
  });
  return app;
};

const staleNonceFetch = (request: supertest.Test) =>
  request
    .set('cookie', '__clerk_handshake_nonce=stale; __client_uat=12345')
    .set('sec-fetch-dest', 'empty')
    .set('accept', '*/*');

describe('clerkMiddleware with __internal_resolveHandshakeOnlyForNavigation (real @clerk/backend)', () => {
  it('by default a stale nonce on a fetch request triggers a failing Backend API call', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await staleNonceFetch(supertest(buildApp()).get('/api/me'));

    expect(response.status).toBe(200);
    expect(payloadRequests).toHaveLength(1);
    expect(payloadRequests[0]).toContain('nonce=stale');
    expect(errorSpy).toHaveBeenCalled();
    // The failed exchange resolves to signed-out with the reason the customer observed in production.
    expect(response.body).toEqual({ status: 'signed-out', reason: 'session-token-missing' });
  });

  it('with __internal_resolveHandshakeOnlyForNavigation: true the unchanged middleware forwards the option and no Backend API call is made', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await staleNonceFetch(
      supertest(buildApp({ __internal_resolveHandshakeOnlyForNavigation: true })).get('/api/me'),
    );

    expect(response.status).toBe(200);
    expect(payloadRequests).toHaveLength(0);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(response.body).toEqual({ status: 'signed-out', reason: 'client-uat-but-no-session-token' });
  });
});
