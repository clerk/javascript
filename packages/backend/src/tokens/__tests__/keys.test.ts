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
import { server } from '../../mock-server';
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

  it('loads the local key in PEM format', () => {
    const jwk = loadClerkJWKFromLocal(mockPEMJwtKey);
    expect(jwk).toMatchObject(mockPEMJwk);
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
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
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
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
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
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
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

  it.skip('retries five times with exponential back-off policy to fetch JWKS before it fails', async () => {
    // fakeFetch.onCall(0).returns(jsonError('something awful happened', 503));
    // fakeFetch.onCall(1).returns(jsonError('server error'));
    // fakeFetch.onCall(2).returns(jsonError('server error'));
    // fakeFetch.onCall(3).returns(jsonError('server error'));
    // fakeFetch.onCall(4).returns(jsonError('Connection to the origin web server failed', 542));

    server.use(
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.json({}, { status: 503 });
      }),
    );

    // vi.runAllTimers();

    try {
      await loadClerkJWKFromRemote({
        secretKey: 'deadbeef',
        kid: 'ins_whatever',
        skipJwksCache: true,
      });
      expect(false).toBe(true);
    } catch (err) {
      if (err instanceof Error) {
        expect(err).toMatchObject({
          reason: 'jwk-remote-failed-to-load',
          action: 'Contact support@clerk.com',
        });
      } else {
        expect(false).toBe(true);
      }
    }
  });

  it('throws an error when JWKS can not be fetched from Backend or Frontend API', async () => {
    try {
      await loadClerkJWKFromRemote({
        kid: 'ins_whatever',
        skipJwksCache: true,
      });
      expect(false).toBe(true);
    } catch (err) {
      if (err instanceof Error) {
        expect(err).toMatchObject({
          reason: 'jwk-remote-failed-to-load',
          action: 'Contact support@clerk.com',
        });
      } else {
        expect(false).toBe(true);
      }
    }
  });

  it('throws an error when no JWK matches the provided kid', async () => {
    server.use(
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
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
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
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
