import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../../errors';
import {
  mockJwks,
  mockJwtPayload,
  mockPEMJwk,
  mockPEMJwtKey,
  mockPEMKey,
  mockRsaJwk,
  mockRsaJwkKid,
} from '../../fixtures';
import { server, validateHeaders } from '../../mock-server';
import { loadClerkJwkFromPem, loadClerkJWKFromRemote } from '../keys';

const MOCK_KID = 'test-kid';

describe('tokens.loadClerkJWKFromLocal(localKey)', () => {
  it('throws an error if no key has been provided', () => {
    expect(() => loadClerkJwkFromPem({ kid: MOCK_KID })).toThrow(
      new TokenVerificationError({
        action: TokenVerificationErrorAction.SetClerkJWTKey,
        message: 'Missing local JWK.',
        reason: TokenVerificationErrorReason.LocalJWKMissing,
      }),
    );
  });

  it('loads the local key', () => {
    const jwk = loadClerkJwkFromPem({ kid: MOCK_KID, pem: mockPEMKey });
    expect(jwk).toMatchObject(mockPEMJwk);
  });

  it('loads the local key in PEM format', () => {
    const jwk = loadClerkJwkFromPem({ kid: MOCK_KID, pem: mockPEMJwtKey });
    expect(jwk).toMatchObject(mockPEMJwk);
  });

  it('caches PEM keys separately for different kids', () => {
    const jwk1 = loadClerkJwkFromPem({ kid: 'ins_1', pem: mockPEMKey }) as JsonWebKey & { kid: string };
    expect(jwk1.kid).toBe('local-ins_1');
    expect(jwk1.n).toBe(mockPEMJwk.n);

    const jwk2 = loadClerkJwkFromPem({ kid: 'ins_2', pem: mockPEMJwtKey }) as JsonWebKey & { kid: string };
    expect(jwk2.kid).toBe('local-ins_2');
    expect(jwk2.n).toBe(mockPEMJwk.n);

    // Verify both are cached independently
    const jwk1Cached = loadClerkJwkFromPem({ kid: 'ins_1', pem: mockPEMKey });
    const jwk2Cached = loadClerkJwkFromPem({ kid: 'ins_2', pem: mockPEMJwtKey });

    expect(jwk1Cached).toBe(jwk1);
    expect(jwk2Cached).toBe(jwk2); // Same object reference means its cached
  });

  it('returns cached JWK on subsequent calls with same kid', () => {
    const jwk1 = loadClerkJwkFromPem({ kid: 'cache-test', pem: mockPEMKey });
    const jwk2 = loadClerkJwkFromPem({ kid: 'cache-test', pem: mockPEMKey });
    // Should return the exact same reference
    expect(jwk1).toBe(jwk2);
  });

  it('uses "local-" prefix to avoid cache collision with remote keys', () => {
    const localJwk = loadClerkJwkFromPem({ kid: 'test-kid', pem: mockPEMKey }) as JsonWebKey & { kid: string };
    expect(localJwk.kid).toBe('local-test-kid');
  });

  it('creates separate cache entries for different kids even with same PEM', () => {
    // Two JWT keys might theoretically use the same PEM (unlikely but possible)
    const jwkA = loadClerkJwkFromPem({ kid: 'ins_key_a', pem: mockPEMKey }) as JsonWebKey & { kid: string };
    const jwkB = loadClerkJwkFromPem({ kid: 'ins_key_b', pem: mockPEMKey }) as JsonWebKey & { kid: string };

    // They should be different objects
    expect(jwkA).not.toBe(jwkB);
    // But have the same modulus
    expect(jwkA.n).toBe(jwkB.n);
    // And different prefixed kids
    expect(jwkA.kid).toBe('local-ins_key_a');
    expect(jwkB.kid).toBe('local-ins_key_b');
  });
});

describe('tokens.loadClerkJWKFromRemote(options)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockJwtPayload.iat * 1000).getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads JWKS from Backend API when secretKey is provided', async () => {
    server.use(
      http.get(
        'https://api.clerk.com/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );
    const jwk = await loadClerkJWKFromRemote({
      secretKey: 'sk_test_deadbeef',
      kid: mockRsaJwkKid,
      skipJwksCache: true,
    });

    expect(jwk).toMatchObject(mockRsaJwk);
  });

  it('loads JWKS from Backend API using the provided apiUrl', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const jwk = await loadClerkJWKFromRemote({
      secretKey: 'sk_test_deadbeef',
      apiUrl: 'https://api.clerk.test',
      kid: mockRsaJwkKid,
      skipJwksCache: true,
    });

    expect(jwk).toMatchObject(mockRsaJwk);
  });

  it('caches JWK by kid', async () => {
    server.use(
      http.get(
        'https://api.clerk.com/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    let jwk = await loadClerkJWKFromRemote({
      secretKey: 'deadbeef',
      kid: mockRsaJwkKid,
      skipJwksCache: true,
    });
    expect(jwk).toMatchObject(mockRsaJwk);
    jwk = await loadClerkJWKFromRemote({
      secretKey: 'deadbeef',
      kid: mockRsaJwkKid,
    });
    expect(jwk).toMatchObject(mockRsaJwk);
  });

  it('retries five times with exponential back-off policy to fetch JWKS before it fails', async () => {
    server.use(
      http.get(
        'https://api.clerk.com/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json({}, { status: 503 });
        }),
      ),
    );

    await expect(async () => {
      const promise = loadClerkJWKFromRemote({
        secretKey: 'deadbeef',
        kid: 'ins_whatever',
        skipJwksCache: true,
      });
      void vi.advanceTimersByTimeAsync(60000);
      await promise;
    }).rejects.toThrowError('Error loading Clerk JWKS from https://api.clerk.com/v1/jwks with code=503');
  });

  it('throws an error when JWKS can not be fetched from Backend or Frontend API', async () => {
    await expect(() =>
      loadClerkJWKFromRemote({
        kid: 'ins_whatever',
        skipJwksCache: true,
      }),
    ).rejects.toThrowError('Failed to load JWKS from Clerk Backend or Frontend API.');
  });

  it('throws an error when no JWK matches the provided kid', async () => {
    server.use(
      http.get(
        'https://api.clerk.com/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const kid = 'ins_whatever';

    await expect(() =>
      loadClerkJWKFromRemote({
        secretKey: 'deadbeef',
        kid,
      }),
    ).rejects.toThrowError(
      "Unable to find a signing key in JWKS that matches the kid='ins_whatever' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid is available: ins_2GIoQhbUpy0hX7B2cVkuTMinXoD",
    );
  });

  it('cache TTLs do not conflict', async () => {
    server.use(
      http.get(
        'https://api.clerk.com/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    let jwk = await loadClerkJWKFromRemote({
      secretKey: 'deadbeef',
      kid: mockRsaJwkKid,
      skipJwksCache: true,
    });
    expect(jwk).toMatchObject(mockRsaJwk);

    vi.advanceTimersByTime(60 * 60 * 1000 - 5);

    jwk = await loadClerkJWKFromRemote({
      secretKey: 'deadbeef',
      kid: mockRsaJwkKid,
    });
    expect(jwk).toMatchObject(mockRsaJwk);

    vi.runAllTicks();

    jwk = await loadClerkJWKFromRemote({
      secretKey: 'deadbeef',
      kid: mockRsaJwkKid,
    });
    expect(jwk).toMatchObject(mockRsaJwk);
  });
});
