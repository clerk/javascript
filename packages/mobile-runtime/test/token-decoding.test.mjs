import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [label, jwt] of [
  ['valid raw token', tokenFixture().jwt],
  ['missing JWT segment', 'header.body'],
  ['invalid base64 header', '!!!.e30.signature'],
  ['invalid JSON payload', 'e30.bm90LWpzb24.signature'],
]) {
  test(`Session.getToken handles ${label}`, async t => {
    const f = await fixture({
      client: fixtures.authenticatedClient,
      timerMilliseconds: ms => Math.min(ms, 1),
      http: request => {
        if (request.url.includes('/tokens')) return response(null, { body: JSON.stringify({ object: 'token', jwt }) });
      },
    });
    t.after(f.dispose);
    const session = f.state.roots.session;
    assert.ok(session);
    const result = await f.invoke(session, 'Session.getToken', [{ skipCache: true }]);
    if (label === 'valid raw token') {
      assert.equal(result.failure, undefined);
      assert.equal(result.result, jwt);
    } else {
      assert.ok(result.failure, JSON.stringify(result));
      assert.notEqual(result.result, jwt);
      assert.deepEqual(f.state.roots.session, session);
      assert.equal((await f.invoke(f.state.roots.signIn, 'SignIn.reset')).failure, undefined);
    }
  });
}
