import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [name, statuses, lastActive, expected] of [
  ['missing selection falls back to the first signed-in session', ['active'], null, 'session_0'],
  ['unmatched selection falls back to the first signed-in session', ['active'], 'missing', 'session_0'],
  ['selected pending session is retained', ['pending'], 'session_0', 'session_0'],
  ['selected active session is retained', ['active'], 'session_0', 'session_0'],
  ['selection wins across multiple sessions', ['active', 'active', 'pending'], 'session_1', 'session_1'],
  ['inactive sessions are excluded from initial selection', ['expired'], 'session_0', null],
]) {
  test(`initial core selection: ${name}`, async t => {
    const sessions = statuses.map((status, index) => ({ ...sessionFixture(status), id: `session_${index}` }));
    const f = await fixture({ client: { ...fixtures.client, sessions, last_active_session_id: lastActive } });
    t.after(f.dispose);
    assert.equal(f.state.roots.session && f.resource(f.state.roots.session).id, expected);
    if (statuses[0] === 'pending')
      assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
  });
}

for (const change of ['unchanged', 'timestamp', 'pending', 'expired', 'removed', 'replaced']) {
  test(`session reload publishes ${change} state before completing`, async t => {
    const session = sessionFixture();
    const next =
      change === 'pending'
        ? { ...session, status: 'pending', tasks: [{ key: 'choose-organization' }] }
        : change === 'expired'
          ? { ...session, status: 'expired' }
          : change === 'timestamp'
            ? { ...session, updated_at: session.updated_at + 1000 }
            : session;
    const client = { ...fixtures.client, sessions: [session], last_active_session_id: session.id };
    const nextClient = {
      ...client,
      sessions:
        change === 'removed' ? [] : change === 'replaced' ? [{ ...session, id: 'replacement_session' }] : [next],
      last_active_session_id: change === 'replaced' ? 'replacement_session' : session.id,
    };
    const f = await fixture({
      client,
      http: request => {
        if (new URL(request.url).pathname.endsWith(`/sessions/${session.id}`))
          return response(next, { body: JSON.stringify({ response: next, client: nextClient }) });
      },
    });
    t.after(f.dispose);
    const handle = f.state.roots.session;
    const result = await f.invoke(handle, 'Session.reload');
    assert.equal(result.failure, undefined, JSON.stringify(result));
    const state = f.resource(result.result.$ref);
    assert.equal(state.status, next.status);
    assert.equal(state.updatedAt, new Date(next.updated_at).toISOString());
    if (['expired', 'removed', 'replaced'].includes(change)) {
      assert.equal(f.state.roots.session, null);
      assert.equal((await f.invoke(handle, 'Session.getToken')).failure.code, 'stale_resource');
    } else {
      assert.deepEqual(f.state.roots.session, handle);
      if (change === 'pending') assert.equal(f.resource(handle).currentTask.key, 'choose-organization');
    }
    if (change === 'replaced') {
      const clerk = f.resource(f.state.roots.clerk);
      assert.equal(f.resource(clerk.sessions[0].$ref).id, 'replacement_session');
    }
  });
}
