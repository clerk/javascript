import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isTokenExpiringSoon, SWRClientCache } from '../swr-client-cache';

// Mock SafeLocalStorage
const mockStorage = new Map<string, string>();
vi.mock('../../utils/localStorage', () => ({
  SafeLocalStorage: {
    setItem: vi.fn((key: string, value: unknown, ttl?: number) => {
      mockStorage.set(`__clerk_${key}`, JSON.stringify({ value, ...(ttl && { exp: Date.now() + ttl }) }));
    }),
    getItem: vi.fn(<T>(key: string, defaultValue: T) => {
      const raw = mockStorage.get(`__clerk_${key}`);
      if (!raw) return defaultValue;
      const entry = JSON.parse(raw);
      if (entry.exp && Date.now() > entry.exp) {
        mockStorage.delete(`__clerk_${key}`);
        return defaultValue;
      }
      return entry.value ?? defaultValue;
    }),
    removeItem: vi.fn((key: string) => {
      mockStorage.delete(`__clerk_${key}`);
    }),
  },
}));

beforeEach(() => mockStorage.clear());

describe('SWRClientCache', () => {
  const publishableKey = 'pk_test_abc123';

  describe('save', () => {
    it('saves a client snapshot without lastActiveToken or signIn/signUp', () => {
      const snapshot = {
        object: 'client' as const,
        id: 'client_123',
        sessions: [
          {
            object: 'session' as const,
            id: 'sess_123',
            status: 'active',
            last_active_token: { object: 'token', id: 'tok_1', jwt: 'eyJ...' },
            user: { object: 'user', id: 'user_123', first_name: 'Alice' },
            last_active_organization_id: 'org_123',
          },
        ],
        sign_in: { object: 'sign_in', id: 'si_123', status: 'needs_second_factor' },
        sign_up: { object: 'sign_up', id: 'su_123', status: 'missing_requirements' },
        last_active_session_id: 'sess_123',
      };

      SWRClientCache.save(snapshot as any, publishableKey);

      const saved = SWRClientCache.read(publishableKey);
      expect(saved).not.toBeNull();
      // JWT stripped
      expect(saved!.sessions[0].last_active_token).toBeNull();
      // signIn/signUp stripped
      expect(saved!.sign_in).toBeNull();
      expect(saved!.sign_up).toBeNull();
      // Profile data preserved
      expect(saved!.sessions[0].user.first_name).toBe('Alice');
    });

    it('does not save synthetic JWT-derived clients (id: client_init)', () => {
      const snapshot = {
        object: 'client' as const,
        id: 'client_init',
        sessions: [],
      };

      SWRClientCache.save(snapshot as any, publishableKey);
      expect(SWRClientCache.read(publishableKey)).toBeNull();
    });
  });

  describe('read', () => {
    it('returns null when no cache exists', () => {
      expect(SWRClientCache.read(publishableKey)).toBeNull();
    });

    it('scopes cache by publishable key', () => {
      const snapshot = {
        object: 'client',
        id: 'client_1',
        sessions: [{ object: 'session', id: 'sess_1', status: 'active', user: { object: 'user', id: 'user_1' } }],
        sign_in: null,
        sign_up: null,
        last_active_session_id: 'sess_1',
      };
      SWRClientCache.save(snapshot as any, publishableKey);
      expect(SWRClientCache.read('pk_test_other')).toBeNull();
      expect(SWRClientCache.read(publishableKey)).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('removes cached client', () => {
      const snapshot = {
        object: 'client',
        id: 'client_1',
        sessions: [{ object: 'session', id: 'sess_1', status: 'active', user: { object: 'user', id: 'user_1' } }],
        sign_in: null,
        sign_up: null,
        last_active_session_id: 'sess_1',
      };
      SWRClientCache.save(snapshot as any, publishableKey);
      SWRClientCache.clear(publishableKey);
      expect(SWRClientCache.read(publishableKey)).toBeNull();
    });
  });
});

describe('isTokenExpiringSoon', () => {
  function makeJwt(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp }));
    return `${header}.${payload}.fake-signature`;
  }

  it('returns false for a token with plenty of time left', () => {
    const exp = Math.floor(Date.now() / 1000) + 60; // 60s from now
    expect(isTokenExpiringSoon(makeJwt(exp))).toBe(false);
  });

  it('returns true for a token expiring within 5 seconds', () => {
    const exp = Math.floor(Date.now() / 1000) + 3; // 3s from now
    expect(isTokenExpiringSoon(makeJwt(exp))).toBe(true);
  });

  it('returns true for an already expired token', () => {
    const exp = Math.floor(Date.now() / 1000) - 10; // 10s ago
    expect(isTokenExpiringSoon(makeJwt(exp))).toBe(true);
  });

  it('returns true for an unparseable token', () => {
    expect(isTokenExpiringSoon('not-a-jwt')).toBe(true);
    expect(isTokenExpiringSoon('')).toBe(true);
  });

  it('returns true for a token at exactly the 5s boundary', () => {
    const exp = Math.floor(Date.now() / 1000) + 5; // exactly 5s from now
    expect(isTokenExpiringSoon(makeJwt(exp))).toBe(true);
  });
});
