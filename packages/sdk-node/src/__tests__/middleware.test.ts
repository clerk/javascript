import type { Request, Response, NextFunction } from 'express';
import Clerk from '../Clerk';
import jwt from 'jsonwebtoken';

const mockNext = jest.fn();

const mockClaims = {
    iss: 'https://clerk.issuer',
    sub: 'subject',
    sid: 'session_id',
}
const mockToken = jwt.sign(mockClaims, 'mock-secret');

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
    const req = { headers: { Authorization: mockToken } } as Request;
    const res = {} as Response;

    const clerk = Clerk.getInstance();
    clerk.verifyToken = jest.fn().mockReturnValue(mockClaims);

    await clerk.expressWithSession()(req, res, mockNext as NextFunction);

    // @ts-ignore
    expect(req.sessionClaims).toEqual(mockClaims);
    // @ts-ignore
    expect(req.session.id).toEqual(mockClaims.sid)
    // @ts-ignore
    expect(req.session.userId).toEqual(mockClaims.sub)

    expect(mockNext).toHaveBeenCalledWith(); // 0 args
});

test('expressWithSession with Authorization header in Bearer format', async () => {
    // @ts-ignore
    const req = { headers: { Authorization: `Bearer ${mockToken}` }} as Request;
    const res = {} as Response;

    const clerk = Clerk.getInstance();
    clerk.verifyToken = jest.fn().mockReturnValue(mockClaims);

    await clerk.expressWithSession()(req, res, mockNext as NextFunction);

    // @ts-ignore
    expect(req.sessionClaims).toEqual(mockClaims);
    // @ts-ignore
    expect(req.session.id).toEqual(mockClaims.sid)
    // @ts-ignore
    expect(req.session.userId).toEqual(mockClaims.sub)

    expect(mockNext).toHaveBeenCalledWith(); // 0 args
});
