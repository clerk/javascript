import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, deferred, sessionFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

test('credential rotation rejects a later-issued response authenticated with the old credential', async t => {
  const active = sessionFixture();
  const pending = { ...active, status: 'pending', tasks: [{ key: 'choose-organization' }] };
  const client = { ...fixtures.client, sessions: [active], last_active_session_id: active.id };
  const starts = [deferred(), deferred()],
    releases = [deferred(), deferred()];
  let calls = 0;
  const f = await fixture({
    client,
    http: request => {
      if (!new URL(request.url).pathname.endsWith(`/sessions/${active.id}`)) return;
      const index = calls++;
      if (index >= 2)
        return response(pending, {
          headers: {},
          body: JSON.stringify({ response: pending, client: { ...client, sessions: [pending] } }),
        });
      starts[index].resolve();
      return releases[index].promise;
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const first = f.invoke(handle, 'Session.reload');
  await starts[0].promise;
  const second = f.invoke(handle, 'Session.reload');
  await starts[1].promise;
  releases[0].resolve(
    response(pending, {
      headers: { authorization: 'rotated-client-credential', date: 'Wed, 09 Sep 2026 16:00:01 GMT' },
      body: JSON.stringify({ response: pending, client: { ...client, sessions: [pending] } }),
    }),
  );
  assert.equal((await first).failure, undefined);
  releases[1].resolve(
    response(active, {
      headers: { date: 'Wed, 09 Sep 2026 16:00:02 GMT' },
      body: JSON.stringify({ response: active, client }),
    }),
  );
  assert.equal((await second).failure?.code, 'stale_client_request');
  assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
  assert.equal(f.credential, 'rotated-client-credential');
  assert.equal((await f.invoke(handle, 'Session.reload')).failure, undefined);
});

for (const credential of [null, 'restored-client-credential']) {
  test(`canonical client without a response credential requires ${credential ? 'the restored credential' : 'a credential before hydration'}`, async t => {
    const f = await fixture({
      credential,
      allowFailure: true,
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/environment')) return response(fixtures.environment, { headers: {} });
        if (path.endsWith('/client')) return response(fixtures.authenticatedClient, { headers: {} });
      },
    });
    t.after(f.dispose);
    if (credential) {
      assert.equal(f.ready.kind, 'ready', JSON.stringify(f.ready));
      assert.equal(f.resource(f.state.roots.session).status, 'active');
      assert.equal(f.credential, credential);
    } else {
      assert.equal(f.ready.kind, 'initializationFailed', JSON.stringify(f.ready));
      assert.equal(f.ready.failure.code, 'missing_client_credential');
      assert.equal(f.state, undefined);
      assert.equal(f.credential, null);
    }
  });
}
