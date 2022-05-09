import { AuthStatus } from '@clerk/backend-core';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import Clerk from '../Clerk';

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
  const req = {} as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  await clerk.expressWithAuth()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.auth).toEqual(mockAuthSignedOutProp);

  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressRequireAuth with no session token', async () => {
  // @ts-ignore
  const req = {} as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  await clerk.expressRequireAuth()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.auth).toEqual(mockAuthSignedOutProp);

  expect(mockNext).toHaveBeenCalled();
  expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
});

test('expressWithAuth with Authorization header', async () => {
  // @ts-ignore
  const req = { headers: { authorization: mockToken } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  clerk.base.getAuthState = jest
    .fn()
    .mockReturnValueOnce(mockGetAuthStateResult);

  await clerk.expressWithAuth()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.auth).toEqual(mockAuthProp);
  expect(mockNext).toHaveBeenCalledWith();
});

test('expressWithAuth with Authorization header in Bearer format', async () => {
  // @ts-ignore
  const req = { headers: { authorization: `Bearer ${mockToken}` } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  clerk.base.getAuthState = jest
    .fn()
    .mockReturnValueOnce(mockGetAuthStateResult);

  await clerk.expressWithAuth()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.auth).toEqual(mockAuthProp);

  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressWithAuth non-browser request (curl)', async () => {
  // @ts-ignore
  const req = { headers: { 'User-Agent': 'curl/7.64.1' } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  await clerk.expressWithAuth()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.auth).toEqual(mockAuthSignedOutProp);
  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressWithAuth with empty Authorization header', async () => {
  // @ts-ignore
  const req = { headers: { authorization: '' } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  await clerk.expressWithAuth()(req, res, mockNext as NextFunction);

  //@ts-ignore
  expect(req.auth).toEqual(mockAuthSignedOutProp);
  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});
