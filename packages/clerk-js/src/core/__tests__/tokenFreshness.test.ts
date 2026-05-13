import type { JWT, TokenResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { pickFreshestJwt } from '../tokenFreshness';

function makeToken(opts: { oiat?: number; iat?: number } = {}): TokenResource {
  return {
    jwt: {
      header: { alg: 'RS256', kid: 'kid_1', ...(opts.oiat != null ? { oiat: opts.oiat } : {}) },
      claims: { ...(opts.iat != null ? { iat: opts.iat } : {}) },
    },
    getRawString: () => 'mock-jwt',
  } as unknown as TokenResource;
}

function makeJwt(opts: { oiat?: number; iat?: number } = {}): JWT {
  return {
    header: { alg: 'RS256', kid: 'kid_1', ...(opts.oiat != null ? { oiat: opts.oiat } : {}) },
    claims: { ...(opts.iat != null ? { iat: opts.iat } : {}) },
  } as unknown as JWT;
}

describe('pickFreshestJwt', () => {
  describe('both have oiat (the only reachable path post-rollout)', () => {
    it('picks existing when existing oiat > incoming oiat', () => {
      const existing = makeToken({ oiat: 100 });
      const incoming = makeToken({ oiat: 90 });
      expect(pickFreshestJwt(existing, incoming)).toBe(existing);
    });

    it('picks incoming when existing oiat < incoming oiat', () => {
      const existing = makeToken({ oiat: 90 });
      const incoming = makeToken({ oiat: 100 });
      expect(pickFreshestJwt(existing, incoming)).toBe(incoming);
    });

    it('picks existing when oiat equal and existing iat > incoming iat', () => {
      const existing = makeToken({ oiat: 100, iat: 200 });
      const incoming = makeToken({ oiat: 100, iat: 150 });
      expect(pickFreshestJwt(existing, incoming)).toBe(existing);
    });

    it('picks incoming when oiat equal and existing iat < incoming iat', () => {
      const existing = makeToken({ oiat: 100, iat: 150 });
      const incoming = makeToken({ oiat: 100, iat: 200 });
      expect(pickFreshestJwt(existing, incoming)).toBe(incoming);
    });

    it('picks existing when oiat equal and iat equal (identical, no churn)', () => {
      const existing = makeToken({ oiat: 100, iat: 150 });
      const incoming = makeToken({ oiat: 100, iat: 150 });
      expect(pickFreshestJwt(existing, incoming)).toBe(existing);
    });

    it('picks existing when oiat equal and incoming iat missing (treated as 0)', () => {
      const existing = makeToken({ oiat: 100, iat: 150 });
      const incoming = makeToken({ oiat: 100 });
      expect(pickFreshestJwt(existing, incoming)).toBe(existing);
    });
  });

  describe('legacy (missing oiat) safety net', () => {
    it('picks existing when incoming is legacy (no oiat) and existing has oiat', () => {
      const existing = makeToken({ oiat: 100 });
      const incoming = makeToken({ iat: 9999 });
      expect(pickFreshestJwt(existing, incoming)).toBe(existing);
    });

    it('picks incoming when existing is legacy and incoming has oiat', () => {
      const existing = makeToken({ iat: 9999 });
      const incoming = makeToken({ oiat: 100 });
      expect(pickFreshestJwt(existing, incoming)).toBe(incoming);
    });

    it('picks incoming when both sides are legacy (cannot rank, safe default)', () => {
      const existing = makeToken({ iat: 200 });
      const incoming = makeToken({ iat: 100 });
      expect(pickFreshestJwt(existing, incoming)).toBe(incoming);
    });
  });

  describe('JWT input (cookie path)', () => {
    it('accepts raw decoded JWT for both arguments', () => {
      const a = makeJwt({ oiat: 100 });
      const b = makeJwt({ oiat: 200 });
      expect(pickFreshestJwt(a, b)).toBe(b);
      expect(pickFreshestJwt(b, a)).toBe(b);
    });

    it('tie-breaks by iat on equal oiat for raw JWT inputs', () => {
      const a = makeJwt({ oiat: 100, iat: 150 });
      const b = makeJwt({ oiat: 100, iat: 200 });
      expect(pickFreshestJwt(a, b)).toBe(b);
      expect(pickFreshestJwt(b, a)).toBe(b);
    });
  });
});
