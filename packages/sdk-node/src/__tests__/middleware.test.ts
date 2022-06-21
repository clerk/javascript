import { AuthStatus } from '@clerk/backend-core';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import Clerk, { WithAuthProp } from '../Clerk';

const mockGetToken = jest.fn();

jest.mock('@clerk/backend-core', () => {
  return {
    ...jest.requireActual('@clerk/backend-core'),
    createGetToken: () => mockGetToken,
    createSignedOutState: () => ({
      getToken: mockGetToken,
    }),
  };
});

const mockNext = jest.fn();

const mockGetAuthStateClaims = {
  sub: 'user_id',
  sid: 'session_id',
};

const mockGetAuthStateResult = {
  sessionClaims: mockGetAuthStateClaims,
  status: AuthStatus.SignedIn,
};

const mockAuthProp = {
  getToken: mockGetToken,
  userId: 'user_id',
  sessionId: 'session_id',
  claims: mockGetAuthStateClaims,
};

const mockAuthSignedOutProp = {
  getToken: mockGetToken,
  userId: null,
  sessionId: null,
  claims: null,
};

const mockToken = jwt.sign(mockGetAuthStateClaims, 'mock-secret');

afterEach(() => {
  mockNext.mockReset();
});

test('expressWithAuth with no session token', async () => {
  // @ts-ignore
  const req = {} as WithAuthProp<Request>;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  const clerkMiddleware = clerk.expressWithAuth();
  await clerkMiddleware(req, res, mockNext as NextFunction);

  expect(req.auth).toEqual(mockAuthSignedOutProp);
  expect(mockNext).toHaveBeenCalledWith();
});

test('expressRequireAuth with no session token', async () => {
  const req = {} as WithAuthProp<Request>;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  const clerkRequireAuthMiddleware = clerk.expressRequireAuth();
  await clerkRequireAuthMiddleware(req, res, mockNext as NextFunction);

  expect(req.auth).toEqual(mockAuthSignedOutProp);

  expect(mockNext).toHaveBeenCalled();
  expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
});

test('expressWithAuth with Authorization header', async () => {
  const req = {
    headers: { authorization: mockToken },
  } as WithAuthProp<Request>;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  clerk.base.getAuthState = jest
    .fn()
    .mockReturnValueOnce(mockGetAuthStateResult);

  const clerkWithAuthMiddleware = clerk.expressWithAuth();
  await clerkWithAuthMiddleware(req, res, mockNext as NextFunction);

  expect(req.auth).toEqual(mockAuthProp);
  expect(mockNext).toHaveBeenCalledWith();
});

test('expressWithAuth with Authorization header in Bearer format', async () => {
  const req = {
    headers: { authorization: `Bearer ${mockToken}` },
  } as WithAuthProp<Request>;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  clerk.base.getAuthState = jest
    .fn()
    .mockReturnValueOnce(mockGetAuthStateResult);

  const clerkWithAuthMiddleware = clerk.expressWithAuth();
  await clerkWithAuthMiddleware(req, res, mockNext as NextFunction);

  expect(req.auth).toEqual(mockAuthProp);
  expect(mockNext).toHaveBeenCalledWith();
});

test('expressWithAuth non-browser request (curl)', async () => {
  // @ts-ignore
  const req = {
    headers: { 'User-Agent': 'curl/7.64.1' },
  } as WithAuthProp<Request>;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  const clerkWithAuthMiddleware = clerk.expressWithAuth();
  await clerkWithAuthMiddleware(req, res, mockNext as NextFunction);

  expect(req.auth).toEqual(mockAuthSignedOutProp);
  expect(mockNext).toHaveBeenCalledWith();
});

test('expressWithAuth with empty Authorization header', async () => {
  const req = { headers: { authorization: '' } } as WithAuthProp<Request>;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  const clerkWithAuthMiddleware = clerk.expressWithAuth();
  await clerkWithAuthMiddleware(req, res, mockNext as NextFunction);

  expect(req.auth).toEqual(mockAuthSignedOutProp);
  expect(mockNext).toHaveBeenCalledWith();
});
