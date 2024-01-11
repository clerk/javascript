import type QUnit from 'qunit';
import sinon from 'sinon';

import { mockJwks, mockJwt, mockJwtPayload } from '../../fixtures';
import runtime from '../../runtime';
import { jsonOk } from '../../util/testUtils';
import { verifyToken } from '../verify';

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
      const { data } = await verifyToken(mockJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
        skipJwksCache: true,
      });

      assert.propEqual(data, mockJwtPayload);
      assert.ok(fakeFetch.calledOnce);
    });

    test('verifies the token by fetching the JWKs from Backend API when secretKey is provided ', async assert => {
      const { data } = await verifyToken(mockJwt, {
        secretKey: 'a-valid-key',
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
        skipJwksCache: true,
      });

      fakeFetch.calledOnceWith('https://clerk.inspired.puma-74.lcl.dev/v1/jwks', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer a-valid-key',
          'Content-Type': 'application/json',
          'User-Agent': '@clerk/backend@test',
        },
      });
      assert.propEqual(data, mockJwtPayload);
    });
  });
};
