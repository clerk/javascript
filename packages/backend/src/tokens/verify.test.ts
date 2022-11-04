import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { mockJwks, mockJwt, mockJwtPayload } from './fixtures';
import { jsonOk } from './mockFetch';
import { verifyToken } from './verify';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('verify(token, options)', hooks => {
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
        apiKey: 'a-valid-key',
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
        issuer: 'https://clerk.inspired.puma-74.lcl.dev',
        skipJwksCache: true,
      });

      assert.propEqual(payload, mockJwtPayload);
      assert.ok(fakeFetch.calledOnce);
    });

    test('throws an error when the verification fails', async assert => {
      try {
        await verifyToken(mockJwt, {
          apiUrl: 'https://api.clerk.test',
          apiKey: 'a-valid-key',
          issuer: 'whatever',
          skipJwksCache: true,
        });
        // This should never be reached. If it does, the suite should fail
        assert.false(true);
      } catch (err) {
        if (err instanceof Error) {
          assert.equal(
            err.message,
            'Invalid JWT issuer claim (iss) "https://clerk.inspired.puma-74.lcl.dev". Expected "whatever".',
          );
        } else {
          // This should never be reached. If it does, the suite should fail
          assert.false(true);
        }
      }
    });
  });
};
