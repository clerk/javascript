import assert from 'node:assert/strict';
import test from 'node:test';
import { deferred, fixture, response, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const cancelled of [[0], [1], [0, 1]]) {
  test(`coalesced token callers cancel independently: ${cancelled.join(',')}`, async t => {
    const started = deferred();
    const reply = deferred();
    const token = tokenFixture();
    let requests = 0;
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (!new URL(request.url).pathname.endsWith('/tokens/firebase')) return;
        requests++;
        started.resolve();
        return reply.promise;
      },
    });
    t.after(f.dispose);
    const session = f.state.roots.session;
    const ids = ['token-first', 'token-second'];
    const invoke = id => f.invoke(session, 'Session.getToken', [{ template: 'firebase' }], id);
    const first = invoke(ids[0]);
    await started.promise;
    const second = invoke(ids[1]);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(requests, 1);
    const calls = [first, second];
    for (const index of cancelled) {
      f.receive({ kind: 'cancel', id: ids[index] });
      const result = await calls[index];
      assert.equal(result.failure.kind, 'cancelled');
      assert.equal(result.failure.code, 'caller_cancelled');
      assert.equal(result.result, undefined);
    }
    reply.resolve(response(token, { body: JSON.stringify(token) }));
    for (const index of [0, 1].filter(index => !cancelled.includes(index))) {
      const result = await calls[index];
      assert.equal(result.failure, undefined);
      assert.equal(result.result, token.jwt);
    }
    await new Promise(resolve => setImmediate(resolve));
    assert.equal((await invoke('token-after')).result, token.jwt);
    assert.equal(requests, 1);
    for (const id of ids)
      assert.equal(f.messages.filter(message => message.kind === 'complete' && message.id === id).length, 1);
    assert.deepEqual(f.state.roots.session, session);
    assert.equal(
      f.messages.some(message => message.kind === 'runtimeError'),
      false,
    );
  });
}

for (const cancelled of [0, 1]) {
  test(`a shared token failure reaches the surviving caller and permits recovery: cancelled=${cancelled}`, async t => {
    const started = deferred();
    const reply = deferred();
    const token = tokenFixture();
    let requests = 0;
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (!new URL(request.url).pathname.endsWith('/tokens/firebase')) return;
        if (++requests > 1) return response(token, { body: JSON.stringify(token) });
        started.resolve();
        return reply.promise;
      },
    });
    t.after(f.dispose);
    const session = f.state.roots.session;
    const ids = ['token-first', 'token-second'];
    const invoke = id => f.invoke(session, 'Session.getToken', [{ template: 'firebase' }], id);
    const first = invoke(ids[0]);
    await started.promise;
    const second = invoke(ids[1]);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(requests, 1);
    const calls = [first, second];
    f.receive({ kind: 'cancel', id: ids[cancelled] });
    assert.equal((await calls[cancelled]).failure.kind, 'cancelled');
    reply.resolve(
      response(null, {
        status: 403,
        body: JSON.stringify({ errors: [{ code: 'token_denied', message: 'Token denied' }] }),
      }),
    );
    const failure = (await calls[1 - cancelled]).failure;
    assert.equal(failure.status, 403);
    assert.equal(failure.errors[0].code, 'token_denied');
    assert.equal((await invoke('token-recovery')).result, token.jwt);
    assert.equal(requests, 2);
    assert.deepEqual(f.state.roots.session, session);
  });
}
