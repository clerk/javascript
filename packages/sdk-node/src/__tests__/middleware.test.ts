import { AuthStatus } from '@clerk/backend-core';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import Clerk from '../Clerk';

const mockNext = jest.fn();

const mockAuthStateClaims = {
  iss: 'https://clerk.issuer',
  sub: 'subject',
  sid: 'session_id',
};

const mockAuthState = {
  sessionClaims: mockAuthStateClaims,
  session: { id: mockAuthStateClaims.sid, userId: mockAuthStateClaims.sub },
  status: AuthStatus.SignedIn,
};

const mockToken = jwt.sign(mockAuthStateClaims, 'mock-secret');

afterEach(() => {
  mockNext.mockReset();
});

test('expressWithSession with no session token', async () => {
  // @ts-ignore
  const req = {} as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  await clerk.expressWithSession()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.session).toBeUndefined();

  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressRequireSession with no session token', async () => {
  // @ts-ignore
  const req = {} as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();

  await clerk.expressRequireSession()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.session).toBeUndefined();

  expect(mockNext).toHaveBeenCalled();
  expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
});

test('expressWithSession with Authorization header', async () => {
  // @ts-ignore
  const req = { headers: { authorization: mockToken } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  clerk.base.getAuthState = jest.fn().mockReturnValueOnce(mockAuthState);

  await clerk.expressWithSession()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.sessionClaims).toEqual(mockAuthStateClaims);
  // @ts-ignore
  expect(req.session.id).toEqual(mockAuthStateClaims.sid);
  // @ts-ignore
  expect(req.session.userId).toEqual(mockAuthStateClaims.sub);

  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressWithSession with Authorization header in Bearer format', async () => {
  // @ts-ignore
  const req = { headers: { authorization: `Bearer ${mockToken}` } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  clerk.base.getAuthState = jest.fn().mockReturnValueOnce(mockAuthState);

  await clerk.expressWithSession()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.sessionClaims).toEqual(mockAuthStateClaims);
  // @ts-ignore
  expect(req.session.id).toEqual(mockAuthStateClaims.sid);
  // @ts-ignore
  expect(req.session.userId).toEqual(mockAuthStateClaims.sub);

  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressWithSession non-browser request (curl)', async () => {
  // @ts-ignore
  const req = { headers: { 'User-Agent': 'curl/7.64.1' } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  await clerk.expressWithSession()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.session).toBeUndefined();
  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressWithSession with empty Authorization header', async () => {
  // @ts-ignore
  const req = { headers: { authorization: '' } } as Request;
  const res = {} as Response;

  const clerk = Clerk.getInstance();
  await clerk.expressWithSession()(req, res, mockNext as NextFunction);

  // @ts-ignore
  expect(req.session).toBeUndefined();
  expect(mockNext).toHaveBeenCalledWith(); // 0 args
});
