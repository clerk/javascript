import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { jsonError, jsonOk } from '../util/mockFetch';
import { mockJwks, mockRsaJwk, mockRsaJwkKid } from './fixtures';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('tokens.loadClerkJWKFromLocal(localKey)', () => {
    test('throws missing local JWK without local key param', assert => {
      try {
        loadClerkJWKFromLocal();
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.equal(err.message, 'Missing local JWK.');
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });

    test('loads the local PEM format from CLERK_JWT_KEY', assert => {
      assert.propEqual(loadClerkJWKFromLocal('deadbeef'), {
        kid: 'local',
        kty: 'RSA',
        n: '',
        e: 'AQAB',
      });
    });
  });

  module('tokens.loadClerkJWKFromRemote(options)', hooks => {
    let fakeFetch;
    hooks.afterEach(() => {
      fakeFetch && fakeFetch.restore();
      sinon.restore();
    });

    test('loads JWKS from Backend API when apiUrl and apiKey are provided', async assert => {
      const jwk = await loadClerkJWKFromRemote({
        apiUrl: 'https://api.clerk.test',
        apiKey: 'deadbeef',
        kid: mockRsaJwkKid,
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('loads JWKS from Frontend API when issuer is provided', async assert => {
      const jwk = await loadClerkJWKFromRemote({
        issuer: 'https://accounts.inspired.puma-74.lcl.dev',
        kid: mockRsaJwkKid,
      });
      assert.propEqual(jwk, mockRsaJwk);
    });

    test('caches JWK by kid', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));

      let jwk = await loadClerkJWKFromRemote({
        apiUrl: 'https://api.clerk.test',
        apiKey: 'deadbeef',
        kid: mockRsaJwkKid,
        skipJwksCache: true,
      });
      assert.propEqual(jwk, mockRsaJwk);
      jwk = await loadClerkJWKFromRemote({
        apiUrl: 'https://api.clerk.test',
        apiKey: 'deadbeef',
        kid: mockRsaJwkKid,
      });
      assert.propEqual(jwk, mockRsaJwk);
      assert.ok(fakeFetch.calledOnce);
    });

    test('retries five times with exponential back-off policy to fetch JWKS before it fails', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');

      fakeFetch.onCall(0).returns(jsonError({ status: 503, body: 'something awful happened' }));
      fakeFetch.onCall(1).returns(jsonError({ body: 'server error' }));
      fakeFetch.onCall(2).returns(jsonError({ body: 'server error' }));
      fakeFetch.onCall(3).returns(jsonError({ body: 'server error' }));
      fakeFetch.onCall(4).returns(jsonError({ status: 542, body: 'Connection to the origin web server failed' }));
      try {
        await loadClerkJWKFromRemote({
          apiUrl: 'https://api.clerk.test',
          apiKey: 'deadbeef',
          kid: 'ins_whatever',
          skipJwksCache: true,
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-failed-to-load',
            action: 'Contact support@clerk.dev',
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
          apiKey: 'deadbeef',
          kid: 'ins_whatever',
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-failed-to-load',
            action: 'Contact support@clerk.dev',
          });
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });

    test('throws an error when no JWK matches the provided kid', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));

      try {
        await loadClerkJWKFromRemote({
          apiUrl: 'https://api.clerk.test',
          apiKey: 'deadbeef',
          kid: 'ins_whatever',
        });
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.propEqual(err, {
            reason: 'jwk-remote-missing',
            action: 'Contact support@clerk.dev',
          });
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });
  });
};
