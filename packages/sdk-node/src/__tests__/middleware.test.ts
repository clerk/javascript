import type { RequestState } from '@clerk/backend';
import type { NextFunction, Request, Response } from 'express';

import { createClerkExpressRequireAuth } from '../clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from '../clerkExpressWithAuth';
import type { WithAuthProp } from '../types';

const mockNext = jest.fn();

afterEach(() => {
  mockNext.mockReset();
});

const mockClerkClient = () => ({
  authenticateRequest: jest.fn(),
  remotePublicInterstitial: jest.fn(),
  remotePrivateInterstitial: jest.fn(),
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

  it('should halt middleware execution and return empty response with 401 http code for unknown request state', async () => {
    const writeHeadSpy = jest.fn();
    const endSpy = jest.fn();
    const req = { cookies: {}, headers: {} } as Request;
    const res = { writeHead: writeHeadSpy, end: endSpy } as unknown as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: false,
      isInterstitial: false,
      isUnknown: true,
      toAuth: () => ({ sessionId: '1' }),
    } as unknown as RequestState);

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect(writeHeadSpy).toBeCalledWith(401, { 'Content-Type': 'text/html' });
    expect(endSpy).toBeCalledWith();
    expect(mockNext).not.toBeCalled();
  });

  it('should halt middleware execution and return interstitial response with 401 http code for unknown request state', async () => {
    const writeHeadSpy = jest.fn();
    const endSpy = jest.fn();
    const req = { cookies: {}, headers: {} } as Request;
    const res = { writeHead: writeHeadSpy, end: endSpy } as unknown as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: false,
      isInterstitial: true,
      isUnknown: false,
      toAuth: () => ({ sessionId: '1' }),
    } as unknown as RequestState);
    clerkClient.remotePrivateInterstitial.mockResolvedValue('<html>interstitial</html>');

    await createClerkExpressWithAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect(writeHeadSpy).toBeCalledWith(401, { 'Content-Type': 'text/html' });
    expect(endSpy).toBeCalledWith('<html>interstitial</html>');
    expect(mockNext).not.toBeCalled();
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

  it('should halt middleware execution and return empty response with 401 http code for unknown request state', async () => {
    const writeHeadSpy = jest.fn();
    const endSpy = jest.fn();
    const req = { cookies: {}, headers: {} } as Request;
    const res = { writeHead: writeHeadSpy, end: endSpy } as unknown as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: false,
      isInterstitial: false,
      isUnknown: true,
      toAuth: () => ({ sessionId: '1' }),
    } as unknown as RequestState);

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect(writeHeadSpy).toBeCalledWith(401, { 'Content-Type': 'text/html' });
    expect(endSpy).toBeCalledWith();
    expect(mockNext).not.toBeCalled();
  });

  it('should halt middleware execution and return interstitial response with 401 http code for unknown request state', async () => {
    const writeHeadSpy = jest.fn();
    const endSpy = jest.fn();
    const req = { cookies: {}, headers: {} } as Request;
    const res = { writeHead: writeHeadSpy, end: endSpy } as unknown as Response;

    const clerkClient = mockClerkClient() as any;
    clerkClient.authenticateRequest.mockReturnValue({
      isSignedIn: false,
      isInterstitial: true,
      isUnknown: false,
      toAuth: () => ({ sessionId: '1' }),
    } as unknown as RequestState);
    clerkClient.remotePrivateInterstitial.mockResolvedValue('<html>interstitial</html>');

    await createClerkExpressRequireAuth({ clerkClient })()(req, res, mockNext as NextFunction);

    expect(writeHeadSpy).toBeCalledWith(401, { 'Content-Type': 'text/html' });
    expect(endSpy).toBeCalledWith('<html>interstitial</html>');
    expect(mockNext).not.toBeCalled();
  });
});
