import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { M2MToken } from '../M2MToken';

describe('M2MToken', () => {
  describe('fromJwtPayload', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1666648250 * 1000)); // Same as iat
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('creates M2MToken from JWT payload', () => {
      const payload = {
        iss: 'https://clerk.m2m.example.test',
        sub: 'mch_2vYVtestTESTtestTESTtestTESTtest',
        aud: ['mch_1xxxxx', 'mch_2xxxxx'],
        exp: 1666648550,
        iat: 1666648250,
        nbf: 1666648240,
        jti: 'mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.id).toBe('mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE');
      expect(token.subject).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
      expect(token.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      // `aud` is a user-supplied custom claim (the backend does not auto-add it),
      // so it is surfaced through `claims` while also seeding the `scopes` field.
      expect(token.claims).toEqual({ aud: ['mch_1xxxxx', 'mch_2xxxxx'] });
      expect(token.revoked).toBe(false);
      expect(token.revocationReason).toBeNull();
      expect(token.expired).toBe(false);
      expect(token.expiration).toBe(1666648550 * 1000);
      expect(token.createdAt).toBe(1666648250 * 1000);
      expect(token.updatedAt).toBe(1666648250 * 1000);
    });

    it('preserves custom claims (including aud and scopes) and strips only structural claims', () => {
      const payload = {
        iss: 'https://clerk.m2m.example.test',
        sub: 'mch_2vYVtestTESTtestTESTtestTESTtest',
        aud: ['mch_1xxxxx'],
        exp: 1666648550,
        iat: 1666648250,
        nbf: 1666648240,
        jti: 'mt_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE',
        scopes: 'scope1 scope2',
        permissions: ['read:users', 'read:orders'],
        role: 'service',
      };

      const token = M2MToken.fromJwtPayload(payload);

      // `aud` and `scopes` are user-supplied custom claims in Clerk-issued M2M
      // tokens (the backend neither reserves nor auto-adds them), so they are
      // preserved in `claims` alongside any other custom claims.
      expect(token.claims).toEqual({
        aud: ['mch_1xxxxx'],
        scopes: 'scope1 scope2',
        permissions: ['read:users', 'read:orders'],
        role: 'service',
      });
      // Structural claims are mapped to dedicated fields, not leaked into `claims`.
      expect(token.claims).not.toHaveProperty('iss');
      expect(token.claims).not.toHaveProperty('sub');
      expect(token.claims).not.toHaveProperty('exp');
      expect(token.claims).not.toHaveProperty('nbf');
      expect(token.claims).not.toHaveProperty('iat');
      expect(token.claims).not.toHaveProperty('jti');
      // `scopes` is still derived onto the dedicated `scopes` field.
      expect(token.scopes).toEqual(['scope1', 'scope2']);
    });

    it('prefers scopes claim over aud when both are present', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
        scopes: 'scope1 scope2',
        aud: ['aud1', 'aud2'],
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.scopes).toEqual(['scope1', 'scope2']);
    });

    it('parses scopes from space-separated string when aud is missing', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
        scopes: 'scope1 scope2 scope3',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.scopes).toEqual(['scope1', 'scope2', 'scope3']);
    });

    it('returns empty scopes when neither aud nor scopes present', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.scopes).toEqual([]);
    });

    it('marks token as expired when exp is in the past', () => {
      vi.setSystemTime(new Date(1666648600 * 1000)); // After exp

      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
        jti: 'mt_test',
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.expired).toBe(true);
    });

    it('handles missing jti gracefully', () => {
      const payload = {
        sub: 'mch_test',
        exp: 1666648550,
        iat: 1666648250,
      };

      const token = M2MToken.fromJwtPayload(payload);

      expect(token.id).toBe('');
    });
  });
});
