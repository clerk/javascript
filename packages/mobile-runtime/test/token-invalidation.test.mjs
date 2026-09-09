import assert from 'node:assert/strict';
import test from 'node:test';
import { deferred, fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

function token(originIssuedAt) {
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  return {
    object: 'token',
    jwt: `${encode({ alg: 'none', typ: 'JWT', oiat: originIssuedAt })}.${encode({ sid: 'sess_native', iat: now, exp: now + 3600 })}.fixture`,
  };
}

for (const oldReplyFirst of [false, true]) {
  test(`clearing the token cache fences earlier requests when old reply arrives first=${oldReplyFirst}`, async t => {
    const replies = [deferred(), deferred()];
    const started = [deferred(), deferred()];
    const old = token(200);
    const fresh = token(100);
    let requests = 0;
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (!new URL(request.url).pathname.endsWith('/tokens/firebase')) return;
        const index = requests++;
        assert.ok(index < 2, 'the post-clear token should remain cached');
        started[index].resolve();
        return replies[index].promise;
      },
    });
    t.after(f.dispose);
    const session = f.state.roots.session;
    const getToken = () => f.invoke(session, 'Session.getToken', [{ template: 'firebase' }]);
    const first = getToken();
    await started[0].promise;
    assert.equal((await f.invoke(session, 'Session.clearCache')).failure, undefined);
    const second = getToken();
    await started[1].promise;
    const complete = (index, value) => replies[index].resolve(response(value, { body: JSON.stringify(value) }));
    if (oldReplyFirst) {
      complete(0, old);
      assert.equal((await first).result, old.jwt);
      complete(1, fresh);
      assert.equal((await second).result, fresh.jwt);
    } else {
      complete(1, fresh);
      assert.equal((await second).result, fresh.jwt);
      complete(0, old);
      assert.equal((await first).result, old.jwt);
    }
    assert.equal((await getToken()).result, fresh.jwt);
    assert.equal(requests, 2);
    assert.deepEqual(f.state.roots.session, session);
    assert.equal(
      f.messages.some(message => message.kind === 'runtimeError'),
      false,
    );
  });
}
