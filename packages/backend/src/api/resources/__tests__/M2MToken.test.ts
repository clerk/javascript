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
      expect(token.claims).toBeNull();
      expect(token.revoked).toBe(false);
      expect(token.revocationReason).toBeNull();
      expect(token.expired).toBe(false);
      expect(token.expiration).toBe(1666648550);
      expect(token.createdAt).toBe(1666648250);
      expect(token.updatedAt).toBe(1666648250);
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
