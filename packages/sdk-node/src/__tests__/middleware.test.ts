import { RequestState } from '@clerk/backend';
import { NextFunction, Request, Response } from 'express';

import { createClerkExpressRequireAuth } from '../clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from '../clerkExpressWithAuth';
import { WithAuthProp } from '../types';

const mockNext = jest.fn();

afterEach(() => {
  mockNext.mockReset();
});

const mockClerkClient = () => ({
  authenticateRequest: jest.fn(),
  remotePublicInterstitial: jest.fn(),
});

describe('ClerkExpressWithAuth', () => {
  it('should decorate request with auth and move on to the next middleware when no session token exists', async () => {
    const req = { cookies: {}, headers: {} } as Request;
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: false,
      isInterstitial: false,
      toAuth: () => ({ sessionId: null }),
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual(null);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should decorate request with auth and move on to the next middleware when a session token does exist', async () => {
    const req = { cookies: {}, headers: {} } as Request;
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: true,
      isInterstitial: false,
      toAuth: () => ({ sessionId: '1' }),
    } as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual('1');
    expect(mockNext).toHaveBeenCalledWith();
  });
});

describe('ClerkExpressRequireAuth', () => {
  it('should halt middleware execution by calling next with an error when no session exists', async () => {
    const req = { cookies: {}, headers: {} } as Request;
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: false,
      isInterstitial: false,
      toAuth: () => ({ sessionId: null }),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);
    expect((req as WithAuthProp<Request>).auth).toBe(undefined);
    expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockNext.mock.calls[0][0].message).toBe('Unauthenticated');
  });

  it('should decorate request with auth and move on to the next middleware when a session token does exist', async () => {
    const req = { cookies: {}, headers: {} } as Request;
    const res = {} as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: true,
      isInterstitial: false,
      toAuth: () => ({ sessionId: '1' }),
    } as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect((req as WithAuthProp<Request>).auth.sessionId).toEqual('1');
    expect(mockNext).toHaveBeenCalledWith();
  });
});
