import type { RequestState } from '@clerk/backend';
import type { NextFunction, Request, Response } from 'express';

import { createClerkExpressRequireAuth } from '../clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from '../clerkExpressWithAuth';
import type { WithAuthProp } from '../types';

const mockNext = jest.fn();

const createRequest = () => ({ url: '/path', cookies: {}, headers: { host: 'example.com' } } as Request);

afterEach(() => {
  mockNext.mockReset();
});

const mockClerkClient = () => ({
  authenticateRequest: jest.fn(),
});

describe('ClerkExpressWithAuth', () => {
  it('should decorate request with auth and move on to the next middleware when no session token exists', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: null }),
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
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual('1');
    expect(mockNext).toHaveBeenCalledWith();
  });
});

describe('ClerkExpressRequireAuth', () => {
  it('should halt middleware execution by calling next with an error when no session exists', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      toAuth: () => ({ sessionId: null }),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth).toBe(undefined);
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockNext.mock.calls[0][0].message).toBe('Unauthenticated');
  });

  it('should decorate request with auth and move on to the next middleware when a session token does exist', async () => {
    const req = createRequest();
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: true,
      toAuth: () => ({ sessionId: '1' }),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual('1');
    expect(mockNext).toHaveBeenCalledWith();
  });
});
