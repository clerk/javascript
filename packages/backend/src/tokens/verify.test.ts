import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { jsonOk } from '../util/mockFetch';
import { mockJwks, mockJwt, mockJwtPayload } from './fixtures';
import { verifyToken } from './verify';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('tokens.verify(token, options)', hooks => {
    let fakeClock;
    let fakeFetch;

    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers(new Date(mockJwtPayload.iat * 1000).getTime());
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
    });

    hooks.afterEach(() => {
      fakeClock.restore();
      fakeFetch.restore();
      sinon.restore();
    });

    test('verifies the provided session JWT', async assert => {
      const payload = await verifyToken(mockJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
        issuer: 'https://clerk.inspired.puma-74.lcl.dev',
        skipJwksCache: true,
      });

      assert.propEqual(payload, mockJwtPayload);
      assert.ok(fakeFetch.calledOnce);
    });

    test('verifies the token by fetching the JWKs from Backend API when secretKey is provided ', async assert => {
      const payload = await verifyToken(mockJwt, {
        secretKey: 'a-valid-key',
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
        issuer: 'https://clerk.inspired.puma-74.lcl.dev',
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://clerk.inspired.puma-74.lcl.dev/v1/jwks', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer a-valid-key',
          'Content-Type': 'application/json',
          'Clerk-Backend-SDK': '@clerk/backend',
        },
      });
      assert.propEqual(payload, mockJwtPayload);
    });

    test('verifies the token by fetching the JWKs from Frontend API when issuer (string) is provided ', async assert => {
      const payload = await verifyToken(mockJwt, {
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
        issuer: 'https://clerk.inspired.puma-74.lcl.dev',
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://clerk.inspired.puma-74.lcl.dev/.well-known/jwks.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Clerk-Backend-SDK': '@clerk/backend',
        },
      });
      assert.propEqual(payload, mockJwtPayload);
    });

    test('throws an error when the verification fails', async assert => {
      try {
        await verifyToken(mockJwt, {
          secretKey: 'a-valid-key',
          issuer: 'https://clerk.whatever.lcl.dev',
          skipJwksCache: true,
        });
        // This should never be reached. If it does, the suite should fail
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.equal(
            err.message,
            'Invalid JWT issuer claim (iss) "https://clerk.inspired.puma-74.lcl.dev". Expected "https://clerk.whatever.lcl.dev".',
          );
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });
  });
};
