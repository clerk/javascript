import assert from 'node:assert/strict';
import test from 'node:test';
import { deferred, fixture, response, sessionFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const earlier = 'Wed, 09 Sep 2026 16:00:00 GMT';
const later = 'Wed, 09 Sep 2026 16:00:01 GMT';
const after = 'Wed, 09 Sep 2026 16:00:02 GMT';

test('session changes become visible only after the client credential is persisted', async t => {
  const active = sessionFixture();
  const pending = { ...active, status: 'pending', tasks: [{ key: 'choose-organization' }] };
  const client = { ...fixtures.client, sessions: [active], last_active_session_id: active.id };
  const started = deferred(),
    finish = deferred();
  const f = await fixture({
    client,
    credentialWrite: async value => {
      if (value !== 'pending-client-credential') return;
      started.resolve();
      await finish.promise;
    },
    http: request => {
      if (!new URL(request.url).pathname.endsWith(`/sessions/${active.id}`)) return;
      return response(pending, {
        headers: { date: later, authorization: 'pending-client-credential' },
        body: JSON.stringify({ response: pending, client: { ...client, sessions: [pending] } }),
      });
    },
  });
  t.after(f.dispose);
  const previousCredential = f.credential;
  let completed = false;
  const reload = f.invoke(f.state.roots.session, 'Session.reload').then(value => {
    completed = true;
    return value;
  });
  await started.promise;
  assert.equal(completed, false);
  assert.equal(f.resource(f.state.roots.session).status, 'active');
  assert.equal(f.credential, previousCredential);
  finish.resolve();
  const result = await reload;
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
  assert.equal(f.credential, 'pending-client-credential');
});

test('failed credential persistence preserves the visible session and permits retry', async t => {
  const active = sessionFixture();
  const pending = { ...active, status: 'pending', tasks: [{ key: 'choose-organization' }] };
  const client = { ...fixtures.client, sessions: [active], last_active_session_id: active.id };
  let failWrite = false;
  const f = await fixture({
    client,
    credentialWrite: async () => {
      if (failWrite) throw Object.assign(new Error('Storage unavailable'), { code: 'secure_storage_locked' });
    },
    http: request => {
      if (!new URL(request.url).pathname.endsWith(`/sessions/${active.id}`)) return;
      return response(pending, {
        headers: { date: later, authorization: 'pending-client-credential' },
        body: JSON.stringify({ response: pending, client: { ...client, sessions: [pending] } }),
      });
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const previousCredential = f.credential;
  failWrite = true;
  const failed = await f.invoke(handle, 'Session.reload');
  assert.equal(failed.failure?.code, 'secure_storage_locked');
  assert.equal(f.resource(f.state.roots.session).status, 'active');
  assert.equal(f.credential, previousCredential);
  failWrite = false;
  const retried = await f.invoke(handle, 'Session.reload');
  assert.equal(retried.failure, undefined, JSON.stringify(retried));
  assert.equal(f.resource(f.state.roots.session).status, 'pending');
  assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
  assert.equal(f.credential, 'pending-client-credential');
});

for (const [name, oldDate, newDate, newerVersion, accepted, envelope = 'client'] of [
  ['older server date', earlier, later, false, false],
  ['equal date and older client version', later, later, false, false],
  ['missing server dates', undefined, undefined, true, false],
  ['invalid server dates', 'invalid', 'invalid', true, false],
  ['newer server date despite older request', after, later, false, true],
  ['equal date and newer client version despite older request', later, later, true, true],
  ['older meta.client response', earlier, later, false, false, 'meta'],
  ['newer meta.client server date', after, later, false, true, 'meta'],
]) {
  test(`client response ordering preserves server state: ${name}`, async t => {
    const active = sessionFixture();
    const pending = {
      ...active,
      status: 'pending',
      tasks: [{ key: 'choose-organization' }],
      updated_at: active.updated_at + 1000,
    };
    const base = {
      ...fixtures.client,
      object: 'client',
      id: 'client_ordering',
      sessions: [active],
      last_active_session_id: active.id,
      updated_at: active.updated_at,
    };
    const lateClient = { ...base, updated_at: active.updated_at + (newerVersion ? 2000 : 0) };
    const pendingClient = { ...base, sessions: [pending], updated_at: active.updated_at + 1000 };
    const started = deferred(),
      late = deferred();
    let calls = 0;
    const f = await fixture({
      client: base,
      http: request => {
        if (!new URL(request.url).pathname.endsWith(`/sessions/${active.id}`)) return;
        if (++calls === 1) {
          started.resolve();
          return late.promise;
        }
        return response(pending, {
          headers: { authorization: 'newer-request-credential', ...(newDate ? { date: newDate } : {}) },
          body: JSON.stringify({ response: pending, client: pendingClient }),
        });
      },
    });
    t.after(f.dispose);
    const handle = f.state.roots.session;
    const first = f.invoke(handle, 'Session.reload');
    await started.promise;
    const second = await f.invoke(handle, 'Session.reload');
    assert.equal(second.failure, undefined, JSON.stringify(second));
    assert.equal(f.resource(f.state.roots.session).status, 'pending');
    assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');

    late.resolve(
      response(active, {
        headers: { authorization: 'older-request-credential', ...(oldDate ? { date: oldDate } : {}) },
        body: JSON.stringify({
          response: active,
          ...(envelope === 'meta' ? { meta: { client: lateClient } } : { client: lateClient }),
        }),
      }),
    );
    const result = await first;
    if (accepted) {
      assert.equal(result.failure, undefined, JSON.stringify(result));
      assert.equal(f.resource(f.state.roots.session).status, 'active');
      assert.equal(f.credential, 'older-request-credential');
    } else {
      assert.equal(result.failure?.code, 'stale_client_response');
      assert.equal(f.resource(f.state.roots.session).status, 'pending');
      assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
      assert.equal(f.credential, 'newer-request-credential');
    }
    // A rejected old reply must leave the current resource usable.
    const next = await f.invoke(f.state.roots.session, 'Session.reload');
    assert.equal(next.failure, undefined, JSON.stringify(next));
    assert.equal(f.resource(f.state.roots.session).status, 'pending');
  });
}

test('an older foreground client reply cannot remove a task accepted by a newer session response', async t => {
  const active = sessionFixture();
  const pending = { ...active, status: 'pending', tasks: [{ key: 'choose-organization' }] };
  const client = { ...fixtures.client, sessions: [active], last_active_session_id: active.id };
  const started = deferred(),
    late = deferred();
  let reads = 0;
  const f = await fixture({
    client,
    http: request => {
      const path = new URL(request.url).pathname;
      if (path.endsWith('/client') && ++reads > 1) {
        started.resolve();
        return late.promise;
      }
      if (path.endsWith(`/sessions/${active.id}`))
        return response(pending, {
          headers: { date: later, authorization: 'newer-response-credential' },
          body: JSON.stringify({ response: pending, client: { ...client, sessions: [pending] } }),
        });
    },
  });
  t.after(f.dispose);
  f.receive({ kind: 'lifecycle', state: 'background' });
  f.receive({ kind: 'lifecycle', state: 'foreground' });
  await started.promise;
  const result = await f.invoke(f.state.roots.session, 'Session.reload');
  assert.equal(result.failure, undefined, JSON.stringify(result));
  late.resolve(response(client, { headers: { date: earlier, authorization: 'older-response-credential' } }));
  const deadline = Date.now() + 1000;
  while (!f.messages.some(message => message.kind === 'lifecycleError') && Date.now() < deadline)
    await new Promise(resolve => setTimeout(resolve, 1));
  assert.equal(f.messages.find(message => message.kind === 'lifecycleError')?.failure?.code, 'stale_client_response');
  assert.equal(f.resource(f.state.roots.session).status, 'pending');
  assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
  assert.equal(f.credential, 'newer-response-credential');
});

test('authentication reset starts a new response-date history without signing out the session', async t => {
  const active = sessionFixture();
  const pending = { ...active, status: 'pending', tasks: [{ key: 'choose-organization' }] };
  const client = { ...fixtures.client, sessions: [active], last_active_session_id: active.id };
  const started = deferred(),
    late = deferred();
  let calls = 0;
  const reply = (session, date) =>
    response(session, {
      headers: { date },
      body: JSON.stringify({ response: session, client: { ...client, sessions: [session] } }),
    });
  const f = await fixture({
    client,
    http: request => {
      if (!new URL(request.url).pathname.endsWith(`/sessions/${active.id}`)) return;
      if (++calls === 1) return reply(active, after);
      if (calls === 2) {
        started.resolve();
        return late.promise;
      }
      return reply(pending, earlier);
    },
  });
  t.after(f.dispose);
  assert.equal((await f.invoke(f.state.roots.session, 'Session.reload')).failure, undefined);
  assert.equal((await f.invoke(f.state.roots.signIn, 'SignIn.reset')).failure, undefined);
  assert.equal(f.resource(f.state.roots.session).status, 'active');
  const first = f.invoke(f.state.roots.session, 'Session.reload');
  await started.promise;
  assert.equal((await f.invoke(f.state.roots.session, 'Session.reload')).failure, undefined);
  assert.equal(f.resource(f.state.roots.session).status, 'pending');
  late.resolve(reply(active, later));
  const result = await first;
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(f.resource(f.state.roots.session).status, 'active');
});
