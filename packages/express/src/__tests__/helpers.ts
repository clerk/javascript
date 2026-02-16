import type { AuthObject } from '@clerk/backend';
import type { Application, Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express';
import express from 'express';
import supertest from 'supertest';
import { vi } from 'vitest';

import type { ExpressRequestWithAuth } from '../types';

// Inspired by https://github.com/helmetjs/helmet/blob/main/test/helpers.ts
export function runMiddleware(middleware: RequestHandler | RequestHandler[], headers: Record<string, string> = {}) {
  const app: Application = express();
  app.use(middleware);
  app.use((_req, res, _next) => res.end('Hello world!'));

  return supertest(app).get('/').set(headers);
}

export function runMiddlewareOnPath(
  middleware: RequestHandler | RequestHandler[],
  path: string,
  headers: Record<string, string> = {},
) {
  const app: Application = express();
  app.use(middleware);
  app.use((_req, res, _next) => res.end('Hello world!'));

  return supertest(app).get(path).set(headers);
}

export function mockResponse(): ExpressResponse {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  } as unknown as ExpressResponse;
}

export function mockRequest(): ExpressRequest {
  return {} as ExpressRequest;
}

export function mockRequestWithAuth(auth: Partial<AuthObject> = {}): ExpressRequestWithAuth {
  return {
    auth: () => ({
      getToken: () => Promise.resolve(''),
      has: () => false,
      debug: () => ({}),
      tokenType: 'session_token',
      ...auth,
    }),
  } as unknown as ExpressRequestWithAuth;
}

// Applicable when opting-in to handshake flow
export function assertSignedOutDebugHeaders(response: any) {
  expect(response.header).toHaveProperty('x-clerk-auth-status', 'signed-out');
  expect(response.header).toHaveProperty('x-clerk-auth-reason', 'session-token-and-uat-missing');
  expect(response.header).not.toHaveProperty('x-clerk-auth-message');
}

export function assertNoDebugHeaders(response: any) {
  expect(response.header).not.toHaveProperty('x-clerk-auth-status');
  expect(response.header).not.toHaveProperty('x-clerk-auth-reason');
  expect(response.header).not.toHaveProperty('x-clerk-auth-message');
}
