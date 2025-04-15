import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import type { AuthenticateContext } from '../../tokens/authenticateContext';
import { handshake, signedIn, signedOut } from '../authStatus';

describe('signed-in', () => {
  it('does not include debug headers', () => {
    const authObject = signedIn({
      entity: 'user',
      authenticateContext: {} as AuthenticateContext,
      sessionClaims: {} as JwtPayload,
      token: 'token',
    });

    expect(authObject.headers.get('x-clerk-auth-status')).toBeNull();
    expect(authObject.headers.get('x-clerk-auth-reason')).toBeNull();
    expect(authObject.headers.get('x-clerk-auth-message')).toBeNull();
  });

  it('authObject returned by toAuth() returns the token passed', async () => {
    const signedInAuthObject = signedIn({
      entity: 'user',
      authenticateContext: {} as AuthenticateContext,
      sessionClaims: { sid: 'sid' } as JwtPayload,
      token: 'token',
    }).toAuth();
    const token = await signedInAuthObject.getToken();

    expect(token).toBe('token');
  });
});

describe('signed-out', () => {
  it('includes debug headers', () => {
    const headers = new Headers({ 'custom-header': 'value' });
    const authObject = signedOut({
      entity: 'user',
      authenticateContext: {} as AuthenticateContext,
      reason: 'auth-reason',
      message: 'auth-message',
      headers,
    });

    expect(authObject.headers.get('custom-header')).toBe('value');
    expect(authObject.headers.get('x-clerk-auth-status')).toBe('signed-out');
    expect(authObject.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
    expect(authObject.headers.get('x-clerk-auth-message')).toBe('auth-message');
  });

  it('handles debug headers containing invalid unicode characters without throwing', () => {
    const headers = new Headers({ 'custom-header': 'value' });
    const authObject = signedOut({
      entity: 'user',
      authenticateContext: {} as AuthenticateContext,
      reason: 'auth-reason+RR�56',
      message: 'auth-message+RR�56',
      headers,
    });

    expect(authObject.headers.get('custom-header')).toBe('value');
    expect(authObject.headers.get('x-clerk-auth-status')).toBe('signed-out');
    expect(authObject.headers.get('x-clerk-auth-reason')).toBeNull();
    expect(authObject.headers.get('x-clerk-auth-message')).toBeNull();
  });
});

describe('handshake', () => {
  it('includes debug headers', () => {
    const headers = new Headers({ location: '/' });
    const authObject = handshake({} as any, 'auth-reason', 'auth-message', headers);

    expect(authObject.headers.get('location')).toBe('/');
    expect(authObject.headers.get('x-clerk-auth-status')).toBe('handshake');
    expect(authObject.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
    expect(authObject.headers.get('x-clerk-auth-message')).toBe('auth-message');
  });
});
