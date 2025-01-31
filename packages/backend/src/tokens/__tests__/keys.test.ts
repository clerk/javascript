import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../../errors';
import {
  getMockPEMJwkWithKid,
  mockJwks,
  mockJwtPayload,
  mockPEMJwk,
  mockPEMJwtKey,
  mockPEMKey,
  mockRsaJwk,
  mockRsaJwkKid,
} from '../../fixtures';
import { server, validateHeaders } from '../../mock-server';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from '../keys';

describe('tokens.loadClerkJWKFromLocal(localKey)', () => {
  it('throws an error if no key has been provided', () => {
    expect(() => loadClerkJWKFromLocal()).toThrow(
      new TokenVerificationError({
        action: TokenVerificationErrorAction.SetClerkJWTKey,
        message: 'Missing local JWK.',
        reason: TokenVerificationErrorReason.LocalJWKMissing,
      }),
    );
  });

  it('loads the local key', () => {
    const jwk = loadClerkJWKFromLocal(mockPEMKey);
    expect(jwk).toMatchObject(mockPEMJwk);
  });

  it('loads the local key from default cache', () => {
    const jwk = loadClerkJWKFromLocal(mockPEMKey);
    const cachedJwk = loadClerkJWKFromLocal(undefined);
    expect(jwk).toMatchObject(mockPEMJwk);
    expect(cachedJwk).toMatchObject(mockPEMJwk);
  });

  it('loads the local key from cache with custom kid', () => {
    const kid = 'custom';
    const jwk = loadClerkJWKFromLocal(mockPEMKey, kid);
    const cachedJwk = loadClerkJWKFromLocal(undefined, kid);
    const expectedJwk = getMockPEMJwkWithKid(kid);
    expect(jwk).toMatchObject(expectedJwk);
    expect(cachedJwk).toMatchObject(expectedJwk);
  });

  it('loads the local key in PEM format', () => {
    const kid = 'pem_test';
    const jwk = loadClerkJWKFromLocal(mockPEMJwtKey, kid);
    expect(jwk).toMatchObject(getMockPEMJwkWithKid(kid));
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
      void vi.advanceTimersByTimeAsync(10000);
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
      /Unable to find a signing key in JWKS that matches the kid='ins_whatever' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid is available: .*/,
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
