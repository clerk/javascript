import sinon from 'sinon';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import runtime from '../runtime';
import { mockJwks, mockJwt, mockJwtPayload } from './fixtures';
import { jsonOk } from './mockFetch';
import { verifyToken } from './verify';

let fakeClock;
let fakeFetch;

const testSuite = suite('verifyToken(token, options)');

testSuite.before.each(() => {
  fakeClock = sinon.useFakeTimers(new Date(mockJwtPayload.iat * 1000).getTime());
  fakeFetch = sinon.stub(runtime, 'fetch');
  fakeFetch.onCall(0).returns(jsonOk(mockJwks));
});

testSuite.after.each(() => {
  fakeClock.restore();
  fakeFetch.restore();
});

testSuite('verifies the provided session JWT', async () => {
  const payload = await verifyToken(mockJwt, {
    apiUrl: 'https://api.clerk.test',
    apiKey: 'a-valid-key',
    authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
    issuer: 'https://clerk.inspired.puma-74.lcl.dev',
  });

  assert.equal(payload, mockJwtPayload);
  assert.ok(fakeFetch.calledOnce);
});

testSuite('throws an error when the verification fails', async () => {
  try {
    await verifyToken(mockJwt, {
      apiUrl: 'https://api.clerk.test',
      apiKey: 'a-valid-key',
      issuer: 'whatever',
    });
    assert.unreachable('should have thrown');
  } catch (err) {
    assert.instance(err, Error);
    assert.match(err.message, 'Invalid JWT issuer claim (iss) "https://clerk.inspired.puma-74.lcl.dev".');
    assert.ok(fakeFetch.notCalled);
  }
});

// testSuite.run();

export default testSuite;
