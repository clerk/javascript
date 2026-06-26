import type { JWT, TokenResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import {
  isStrictlyStalerJwt,
  normalizeOrgId,
  pickFreshestJwt,
  pickFreshestOrIncoming,
  tokenOiat,
  tokenOrgId,
  tokenSid,
} from '../tokenFreshness';

interface TokenOpts {
  oiat?: number;
  iat?: number;
  sid?: string;
  orgId?: string;
  oId?: string;
}

function makeClaims(opts: TokenOpts) {
  return {
    ...(opts.iat != null ? { iat: opts.iat } : {}),
    ...(opts.sid != null ? { sid: opts.sid } : {}),
    ...(opts.orgId != null ? { org_id: opts.orgId } : {}),
    ...(opts.oId != null ? { o: { id: opts.oId } } : {}),
  };
}

function makeToken(opts: TokenOpts = {}): TokenResource {
  return {
    jwt: {
      header: { alg: 'RS256', kid: 'kid_1', ...(opts.oiat != null ? { oiat: opts.oiat } : {}) },
      claims: makeClaims(opts),
    },
    getRawString: () => 'mock-jwt',
  } as unknown as TokenResource;
}

function makeJwt(opts: TokenOpts = {}): JWT {
  return {
    header: { alg: 'RS256', kid: 'kid_1', ...(opts.oiat != null ? { oiat: opts.oiat } : {}) },
    claims: makeClaims(opts),
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

    it('picks incoming when oiat equal and iat equal (other claims may differ)', () => {
      // Two tokens with identical oiat+iat may still differ in other claims
      // (azp, org_id, etc.) during a token-format rollout. Only suppress when
      // existing is strictly fresher; on full ties, let incoming through.
      const existing = makeToken({ oiat: 100, iat: 150 });
      const incoming = makeToken({ oiat: 100, iat: 150 });
      expect(pickFreshestJwt(existing, incoming)).toBe(incoming);
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

  describe('same object reference', () => {
    // When the cache hands back the same object that is already stored as
    // lastActiveToken, callers use `pickFreshestJwt(a, b) === a` to detect
    // "existing won, suppress redundant emit". This test documents that
    // intentional behavior.
    it('returns the same reference when both args are the same object', () => {
      const token = makeToken({ oiat: 100, iat: 150 });
      expect(pickFreshestJwt(token, token)).toBe(token);
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

describe('isStrictlyStalerJwt', () => {
  it('returns true when incoming oiat is older than baseline', () => {
    expect(isStrictlyStalerJwt(makeToken({ oiat: 90 }), makeToken({ oiat: 100 }))).toBe(true);
  });

  it('returns false when incoming oiat is newer than baseline', () => {
    expect(isStrictlyStalerJwt(makeToken({ oiat: 100 }), makeToken({ oiat: 90 }))).toBe(false);
  });

  it('returns true when oiat is equal and incoming iat is older', () => {
    expect(isStrictlyStalerJwt(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100, iat: 200 }))).toBe(true);
  });

  it('returns false when oiat and iat are both equal (full tie, fail open)', () => {
    expect(isStrictlyStalerJwt(makeToken({ oiat: 100, iat: 150 }), makeToken({ oiat: 100, iat: 150 }))).toBe(false);
  });

  it('returns false when incoming is missing oiat', () => {
    expect(isStrictlyStalerJwt(makeToken({ iat: 150 }), makeToken({ oiat: 100 }))).toBe(false);
  });

  it('returns false when baseline is missing oiat', () => {
    expect(isStrictlyStalerJwt(makeToken({ oiat: 100 }), makeToken({ iat: 150 }))).toBe(false);
  });

  it('returns false when both are missing oiat', () => {
    expect(isStrictlyStalerJwt(makeToken({ iat: 150 }), makeToken({ iat: 200 }))).toBe(false);
  });

  it('accepts raw decoded JWT inputs', () => {
    expect(isStrictlyStalerJwt(makeJwt({ oiat: 90 }), makeJwt({ oiat: 100 }))).toBe(true);
  });
});

describe('pickFreshestOrIncoming', () => {
  it('returns incoming when existing is null', () => {
    const incoming = makeToken({ oiat: 100 });
    expect(pickFreshestOrIncoming(null, incoming)).toBe(incoming);
  });

  it('returns incoming when existing is undefined', () => {
    const incoming = makeToken({ oiat: 100 });
    expect(pickFreshestOrIncoming(undefined, incoming)).toBe(incoming);
  });

  it('returns the newer token when existing is older than incoming', () => {
    const existing = makeToken({ oiat: 90 });
    const incoming = makeToken({ oiat: 100 });
    expect(pickFreshestOrIncoming(existing, incoming)).toBe(incoming);
  });

  it('returns the newer token when existing is newer than incoming', () => {
    const existing = makeToken({ oiat: 100 });
    const incoming = makeToken({ oiat: 90 });
    expect(pickFreshestOrIncoming(existing, incoming)).toBe(existing);
  });
});

describe('normalizeOrgId', () => {
  it('returns empty string for undefined', () => {
    expect(normalizeOrgId(undefined)).toBe('');
  });

  it('returns empty string for null', () => {
    expect(normalizeOrgId(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(normalizeOrgId('')).toBe('');
  });

  it('returns the org id when present', () => {
    expect(normalizeOrgId('org_1')).toBe('org_1');
  });
});

describe('tokenOrgId', () => {
  it('reads org_id from claims', () => {
    expect(tokenOrgId(makeToken({ orgId: 'org_1' }))).toBe('org_1');
  });

  it('falls back to o.id when org_id is absent', () => {
    expect(tokenOrgId(makeToken({ oId: 'org_2' }))).toBe('org_2');
  });

  it('returns empty string when neither org_id nor o.id is present', () => {
    expect(tokenOrgId(makeToken({ oiat: 100 }))).toBe('');
  });
});

describe('tokenOiat', () => {
  it('returns the oiat header when present', () => {
    expect(tokenOiat(makeToken({ oiat: 100 }))).toBe(100);
  });

  it('returns undefined when oiat is absent', () => {
    expect(tokenOiat(makeToken({ iat: 150 }))).toBeUndefined();
  });
});

describe('tokenSid', () => {
  it('returns the sid claim when present', () => {
    expect(tokenSid(makeToken({ sid: 'session_1' }))).toBe('session_1');
  });

  it('returns undefined when sid is absent', () => {
    expect(tokenSid(makeToken({ oiat: 100 }))).toBeUndefined();
  });
});
