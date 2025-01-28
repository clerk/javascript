import { AuthStatus, constants } from '@clerk/backend/internal';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { createSyncGetAuth, getAuth } from '../createGetAuth';

const mockSecretKey = 'sk_test_mock';

// { alg: 'HS256' }.{ sub: 'user-id' }.sig
const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.0u5CllULtDVD9DUUmUMdJLbBCSNcnv4j3hCaPz4dNr8';
// { alg: 'HS256' }.{ sub: 'user-id-2' }.sig
const mockToken2 = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkLTIifQ.K-mhz0Ber1Hfh2xCwmvsLwhZO_IKLtKt78KTHsecEas';

const mockTokenSignature = hmacSHA1(mockToken, 'sk_test_mock').toString();

describe('createGetAuth(opts)', () => {
  it('returns a getAuth function', () => {
    expect(createSyncGetAuth({ debugLoggerName: 'test', noAuthStatusMessage: 'test' })).toBeInstanceOf(Function);
  });
});

describe('getAuth(req)', () => {
  it('parses and returns the token claims when signed in', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthStatus]: AuthStatus.SignedIn,
        [constants.Headers.AuthToken]: mockToken,
        [constants.Headers.AuthSignature]: mockTokenSignature,
        [constants.Headers.AuthMessage]: 'message',
        [constants.Headers.AuthReason]: 'reason',
      }),
    });

    expect(getAuth(req, { secretKey: mockSecretKey }).userId).toEqual('user-id');
  });

  it('parses and returns the token claims when signed out', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthStatus]: AuthStatus.SignedOut,
        [constants.Headers.AuthMessage]: 'message',
        [constants.Headers.AuthReason]: 'reason',
      }),
    });

    expect(getAuth(req).userId).toEqual(null);
  });

  it('prioritizes the token found in the auth header if a cookie token also exists', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthStatus]: AuthStatus.SignedIn,
        [constants.Headers.AuthToken]: mockToken,
        [constants.Headers.AuthSignature]: mockTokenSignature,
        [constants.Headers.AuthMessage]: 'message',
        [constants.Headers.AuthReason]: 'reason',
        Cookie: `__session=${mockToken2};`,
      }),
    });

    expect(getAuth(req, { secretKey: mockSecretKey }).userId).toEqual('user-id');
  });

  it('throws if auth status is not found', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthToken]: mockToken,
      }),
    });

    expect(() => getAuth(req)).toThrowError();
  });

  it('throws if signature does not match token', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthStatus]: AuthStatus.SignedIn,
        [constants.Headers.AuthToken]: mockToken2,
        [constants.Headers.AuthSignature]: mockTokenSignature,
        [constants.Headers.AuthMessage]: 'message',
        [constants.Headers.AuthReason]: 'reason',
      }),
    });

    expect(() => getAuth(req, { secretKey: mockSecretKey })).toThrowError();
  });
});
