import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { jsonError, jsonOk } from '../util/mockFetch';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import { mockJwks, mockJwtPayload, mockPEMJwk, mockPEMJwtKey, mockPEMKey, mockRsaJwk, mockRsaJwkKid } from './fixtures';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('tokens.loadClerkJWKFromLocal(localKey)', () => {
    test('throws an error if no key has been provided', assert => {
      assert.throws(
        () => loadClerkJWKFromLocal(),
        new TokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: 'Missing local JWK.',
          reason: TokenVerificationErrorReason.LocalJWKMissing,
        }),
      );
    });

    test('loads the local key', assert => {
      const jwk = loadClerkJWKFromLocal(mockPEMKey);
      assert.propContains(jwk, mockPEMJwk);
    });

    test('loads the local key in PEM format', assert => {
      const jwk = loadClerkJWKFromLocal(mockPEMJwtKey);
      assert.propContains(jwk, mockPEMJwk);
    });
  });

  module('tokens.loadClerkJWKFromRemote(options)', hooks => {
    let fakeClock;
    let fakeFetch;
    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers(new Date(mockJwtPayload.iat * 1000).getTime());
      fakeFetch = sinon.stub(runtime, 'fetch');
    });
    hooks.afterEach(() => {
      fakeClock.restore();
      fakeFetch.restore();
      sinon.restore();
    });

    test('loads JWKS from Backend API when apiKey is provided', async assert => {
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
      const jwk = await loadClerkJWKFromRemote({
        apiKey: 'deadbeef',
        kid: mockRsaJwkKid,
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://api.clerk.com/v1/jwks', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer deadbeef',
          'Content-Type': 'application/json',
          'Clerk-Backend-SDK': '@clerk/backend',
        },
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('loads JWKS from Backend API when secretKey is provided', async assert => {
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
      const jwk = await loadClerkJWKFromRemote({
        secretKey: 'sk_test_deadbeef',
        kid: mockRsaJwkKid,
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://api.clerk.com/v1/jwks', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer deadbeef',
          'Content-Type': 'application/json',
          'Clerk-Backend-SDK': '@clerk/backend',
        },
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('loads JWKS from Frontend API when issuer is provided', async assert => {
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
      const jwk = await loadClerkJWKFromRemote({
        issuer: 'https://clerk.inspired.puma-74.lcl.dev',
        kid: mockRsaJwkKid,
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://clerk.inspired.puma-74.lcl.dev/.well-known/jwks.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Clerk-Backend-SDK': '@clerk/backend',
        },
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('loads JWKS from Backend API using the provided apiUrl', async assert => {
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
      const jwk = await loadClerkJWKFromRemote({
        secretKey: 'sk_test_deadbeef',
        apiUrl: 'https://api.clerk.test',
        kid: mockRsaJwkKid,
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://api.clerk.test/v1/jwks', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer sk_test_deadbeef',
          'Content-Type': 'application/json',
          'Clerk-Backend-SDK': '@clerk/backend',
        },
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('caches JWK by kid', async assert => {
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
      let jwk = await loadClerkJWKFromRemote({
        apiKey: 'deadbeef',
        kid: mockRsaJwkKid,
        skipJwksCache: true,
      });
      assert.propEqual(jwk, mockRsaJwk);
      jwk = await loadClerkJWKFromRemote({
        apiKey: 'deadbeef',
        kid: mockRsaJwkKid,
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('retries five times with exponential back-off policy to fetch JWKS before it fails', async assert => {
      // Since the stub the clock and the retry mechanism schedules a retry every some seconds,
      // we need to restore the clock to allow the retries execution
      fakeClock.restore();
      fakeFetch.onCall(0).returns(jsonError('something awful happened', 503));
      fakeFetch.onCall(1).returns(jsonError('server error'));
      fakeFetch.onCall(2).returns(jsonError('server error'));
      fakeFetch.onCall(3).returns(jsonError('server error'));
      fakeFetch.onCall(4).returns(jsonError('Connection to the origin web server failed', 542));

      try {
        await loadClerkJWKFromRemote({
          apiKey: 'deadbeef',
          kid: 'ins_whatever',
          skipJwksCache: true,
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-failed-to-load',
            action: 'Contact support@clerk.com',
          });
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
      assert.equal(fakeFetch.callCount, 5);
    });

    test('throws an error when JWKS can not be fetched from Backend or Frontend API', async assert => {
      try {
        await loadClerkJWKFromRemote({
          kid: 'ins_whatever',
          skipJwksCache: true,
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-failed-to-load',
            action: 'Contact support@clerk.com',
          });
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });

    test('throws an error when JWKS can not be fetched from Backend or Frontend API and cache updated less than 5 minutes ago', async assert => {
      const kid = 'ins_whatever';
      try {
        await loadClerkJWKFromRemote({
          apiKey: 'deadbeef',
          kid,
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-missing',
            action: 'Contact support@clerk.com',
          });
          assert.propContains(err, {
            message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid are available: ${mockRsaJwkKid}, local`,
          });
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });

    test('throws an error when no JWK matches the provided kid', async assert => {
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
      const kid = 'ins_whatever';

      try {
        await loadClerkJWKFromRemote({
          apiKey: 'deadbeef',
          kid,
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-missing',
            action: 'Contact support@clerk.com',
          });
          assert.propContains(err, {
            message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid are available: ${mockRsaJwkKid}, local`,
          });
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });
  });
};
