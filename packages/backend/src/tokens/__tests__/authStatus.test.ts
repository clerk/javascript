import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import { mockTokens, mockVerificationResults } from '../../fixtures/machine';
import type { AuthenticateContext } from '../../tokens/authenticateContext';
import { handshake, signedIn, signedOut } from '../authStatus';

describe('signed-in', () => {
  describe('session tokens', () => {
    it('does not include debug headers', () => {
      const authObject = signedIn({
        tokenType: 'session_token',
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
        tokenType: 'session_token',
        authenticateContext: {} as AuthenticateContext,
        sessionClaims: { sid: 'sid' } as JwtPayload,
        token: 'token',
      }).toAuth();
      const token = await signedInAuthObject.getToken();

      expect(token).toBe('token');
    });
  });

  describe('machine auth tokens', () => {
    it('does not include debug headers', () => {
      const authObject = signedIn({
        tokenType: 'api_key',
        authenticateContext: {} as AuthenticateContext,
        token: mockTokens.api_key,
        machineData: mockVerificationResults.api_key,
      });

      expect(authObject.headers.get('x-clerk-auth-status')).toBeNull();
      expect(authObject.headers.get('x-clerk-auth-reason')).toBeNull();
      expect(authObject.headers.get('x-clerk-auth-message')).toBeNull();
    });

    it('authObject returned by toAuth() returns the token passed', async () => {
      const authObject = signedIn({
        tokenType: 'api_key',
        authenticateContext: {} as AuthenticateContext,
        token: mockTokens.api_key,
        machineData: mockVerificationResults.api_key,
      }).toAuth();

      const token = await authObject.getToken();
      expect(token).toBe('ak_LCWGdaM8mv8K4PC/57IICZQXAeWfCgF30DZaFXHoGn9=');
    });
  });
});

describe('signed-out', () => {
  describe('session tokens', () => {
    it('includes debug headers', () => {
      const headers = new Headers({ 'custom-header': 'value' });
      const authObject = signedOut({
        tokenType: 'session_token',
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
        tokenType: 'session_token',
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

  describe('machine auth tokens', () => {
    it('includes debug headers', () => {
      const headers = new Headers({ 'custom-header': 'value' });
      const authObject = signedOut({
        tokenType: 'api_key',
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

    it('returns an unauthenticated machine object with toAuth()', async () => {
      const signedOutAuthObject = signedOut({
        tokenType: 'm2m_token',
        authenticateContext: {} as AuthenticateContext,
        reason: 'auth-reason',
        message: 'auth-message',
      }).toAuth();

      const token = await signedOutAuthObject.getToken();
      expect(token).toBeNull();
      expect(signedOutAuthObject.tokenType).toBe('m2m_token');
      expect(signedOutAuthObject.id).toBeNull();
      expect(signedOutAuthObject.subject).toBeNull();
      expect(signedOutAuthObject.claims).toBeNull();
      expect(signedOutAuthObject.scopes).toBeNull();
    });
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
