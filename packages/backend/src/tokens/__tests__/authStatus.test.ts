import { describe, expect, it } from 'vitest';

import { handshake, signedIn, signedOut } from '../authStatus';

describe('signed-in', () => {
  it('does not include debug headers', () => {
    const authObject = signedIn({} as any, {} as any, undefined, 'token');
    expect(authObject.headers.get('x-clerk-auth-status')).toBeNull();
    expect(authObject.headers.get('x-clerk-auth-reason')).toBeNull();
    expect(authObject.headers.get('x-clerk-auth-message')).toBeNull();
  });

  it('authObject returned by toAuth() returns the token passed', async () => {
    const signedInAuthObject = signedIn({} as any, { sid: 'sid' } as any, undefined, 'token').toAuth();
    const token = await signedInAuthObject.getToken();
    expect(token).toBe('token');
  });
});

describe('signed-out', () => {
  it('includes debug headers', () => {
    const headers = new Headers({ 'custom-header': 'value' });
    const authObject = signedOut({} as any, 'auth-reason', 'auth-message', headers);

    expect(authObject.headers.get('custom-header')).toBe('value');
    expect(authObject.headers.get('x-clerk-auth-status')).toBe('signed-out');
    expect(authObject.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
    expect(authObject.headers.get('x-clerk-auth-message')).toBe('auth-message');
  });

  it('handles debug headers containing invalid unicode characters without throwing', () => {
    const headers = new Headers({ 'custom-header': 'value' });
    const authObject = signedOut({} as any, 'auth-reason+RR�56', 'auth-message+RR�56', headers);

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
