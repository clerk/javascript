import { AuthStatus, constants } from '@clerk/backend';
import { NextRequest } from 'next/server';

import { createGetAuth, getAuth } from './createGetAuth';

// { alg: 'HS256' }.{ sub: 'user-id' }.sig
const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.0u5CllULtDVD9DUUmUMdJLbBCSNcnv4j3hCaPz4dNr8';
// { alg: 'HS256' }.{ sub: 'user-id-2' }.sig
const mockToken2 = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkLTIifQ.K-mhz0Ber1Hfh2xCwmvsLwhZO_IKLtKt78KTHsecEas';

describe('createGetAuth(opts)', () => {
  it('returns a getAuth function', () => {
    expect(createGetAuth({ debugLoggerName: 'test', noAuthStatusMessage: 'test' })).toBeInstanceOf(Function);
  });
});

describe('getAuth(req)', () => {
  it('parses and returns the token claims when signed in', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthStatus]: AuthStatus.SignedIn,
        [constants.Headers.AuthToken]: mockToken,
        [constants.Headers.AuthMessage]: 'message',
        [constants.Headers.AuthReason]: 'reason',
      }),
    });

    expect(getAuth(req).userId).toEqual('user-id');
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
        [constants.Headers.AuthMessage]: 'message',
        [constants.Headers.AuthReason]: 'reason',
        Cookie: `__session=${mockToken2};`,
      }),
    });

    expect(getAuth(req).userId).toEqual('user-id');
  });

  it('throws if auth status is not found', () => {
    const req = new NextRequest('https://www.clerk.com', {
      headers: new Headers({
        [constants.Headers.AuthToken]: mockToken,
      }),
    });

    expect(() => getAuth(req)).toThrowError();
  });
});
