import type { RequestState } from '@clerk/backend/internal';
import type { NextFunction, Request, Response } from 'express';

import { createClerkExpressRequireAuth } from '../clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from '../clerkExpressWithAuth';
import type { WithAuthProp } from '../types';

const mockNext = jest.fn();

const createRequest = () => ({ url: '/path', cookies: {}, headers: { host: 'example.com' } }) as Request;

afterEach(() => {
  mockNext.mockReset();
});

const mockClerkClient = () => ({
  authenticateRequest: jest.fn(),
});

describe('ClerkExpressWithAuth', () => {
  it('should halt middleware execution by calling next with an error when request URL is invalid', async () => {
    const req = {
      url: '//',
      cookies: {},
      headers: { host: 'example.com' },
    } as Request;
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: null }),
      headers: new Headers(),
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth).toBe(undefined);
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockNext.mock.calls[0][0].message).toBe('Invalid request URL: //');
  });

  it('should decorate request with auth and move on to the next middleware when no session token exists', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: null }),
      headers: new Headers(),
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual(null);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should decorate request with auth and move on to the next middleware when a session token does exist', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: '1' }),
      headers: new Headers(),
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual('1');
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should redirect if a Location header is returned', async () => {
    const req = createRequest();
    const res = {
      status: jest.fn(() => res),
      appendHeader: jest.fn(),
      end: jest.fn(),
      getHeader: jest.fn(),
    } as unknown as Response;

    const headers = new Headers({ Location: 'https://clerk.example.com/v1/handshake' });

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: '1' }),
      headers: new Headers({ Location: 'https://clerk.example.com/v1/handshake' }),
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect(res.status).toHaveBeenCalledWith(307);

    for (const [key, value] of headers.entries()) {
      expect(res.appendHeader).toHaveBeenCalledWith(key, value);
    }
  });
});

describe('ClerkExpressRequireAuth', () => {
  it('should halt middleware execution by calling next with an error when no session exists', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: null }),
      headers: new Headers(),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth).toBe(undefined);
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockNext.mock.calls[0][0].message).toBe('Unauthenticated');
  });

  it('should halt middleware execution by calling next with an error when request URL is invalid', async () => {
    const req = {
      url: '//',
      cookies: {},
      headers: { host: 'example.com' },
    } as Request;
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: null }),
      headers: new Headers(),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth).toBe(undefined);
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockNext.mock.calls[0][0].message).toBe('Invalid request URL: //');
  });

  it('should decorate request with auth and move on to the next middleware when a session token does exist', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: true,
      toAuth: () => ({ sessionId: '1' }),
      headers: new Headers(),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual('1');
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should redirect if a Location header is returned', async () => {
    const req = createRequest();
    const res = {
      status: jest.fn(() => res),
      appendHeader: jest.fn(),
      end: jest.fn(),
      getHeader: jest.fn(),
    } as unknown as Response;

    const headers = new Headers({ Location: 'https://clerk.example.com/v1/handshake' });

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: '1' }),
      headers: new Headers({ Location: 'https://clerk.example.com/v1/handshake' }),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect(res.status).toHaveBeenCalledWith(307);

    for (const [key, value] of headers.entries()) {
      expect(res.appendHeader).toHaveBeenCalledWith(key, value);
    }
  });
});
