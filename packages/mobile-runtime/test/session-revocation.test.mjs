import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const scenario of ['current', 'other', 'rejected']) {
  test(`generated session revocation: ${scenario}`, async t => {
    const session = sessionFixture();
    const client = { ...fixtures.client, sessions: [session], last_active_session_id: session.id };
    const listed = {
      ...session,
      id: scenario === 'other' ? 'sess_other' : session.id,
      user: null,
      latest_activity: {
        id: 'act_fixture',
        device_type: 'iPhone',
        browser_name: 'Safari',
        browser_version: '26',
        country: 'US',
        city: 'New York',
        is_mobile: true,
        ip_address: '192.0.2.1',
      },
    };
    let revokeCount = 0;
    const f = await fixture({
      client,
      http: request => {
        const url = new URL(request.url);
        if (url.pathname.endsWith('/me/sessions/active')) {
          assert.equal(request.method, 'GET');
          return response(null, { body: JSON.stringify([listed]) });
        }
        if (!url.pathname.endsWith('/revoke')) return;
        revokeCount++;
        assert.equal(request.method, 'POST');
        assert.equal(url.pathname, `/v1/me/sessions/${listed.id}/revoke`);
        assert.equal(request.body, '');
        if (scenario === 'rejected')
          return response(null, {
            status: 403,
            body: JSON.stringify({ errors: [{ code: 'session_revoke_denied', message: 'Cannot revoke' }] }),
          });
        const revoked = { ...listed, status: 'revoked' };
        const updatedClient =
          scenario === 'current' ? { ...client, sessions: [{ ...session, status: 'revoked' }] } : client;
        return response(revoked, { body: JSON.stringify({ response: revoked, client: updatedClient }) });
      },
    });
    t.after(f.dispose);
    const selected = f.state.roots.session;
    const sessions = await f.invoke(f.state.roots.user, 'User.getSessions');
    assert.equal(sessions.failure, undefined, JSON.stringify(sessions.failure));
    const handle = sessions.result[0].$ref;
    const state = f.resource(handle);
    assert.equal(state.id, listed.id);
    assert.equal(state.latestActivity.browserName, 'Safari');
    assert.equal(state.latestActivity.isMobile, true);
    const revoked = await f.invoke(handle, 'SessionWithActivities.revoke');
    assert.equal(revokeCount, 1);
    if (scenario === 'rejected') {
      assert.equal(revoked.failure?.status, 403);
      assert.equal(revoked.failure?.errors[0].code, 'session_revoke_denied');
      assert.equal(f.resource(handle).status, 'active');
    } else {
      assert.equal(revoked.failure, undefined, JSON.stringify(revoked.failure));
      assert.equal(f.resource(revoked.result.$ref).status, 'revoked');
      assert.equal(f.resource(revoked.result.$ref).id, listed.id);
    }
    if (scenario === 'current') {
      assert.equal(f.state.roots.session, null);
      assert.equal((await f.invoke(selected, 'Session.getToken')).failure.code, 'stale_resource');
    } else assert.deepEqual(f.state.roots.session, selected);
  });
}

for (const key of ['setup-mfa', 'reset-password', 'another-task']) {
  test(`pending task survives generated projection: ${key}`, async t => {
    const session = { ...sessionFixture('pending'), tasks: [{ key }] };
    const f = await fixture({
      client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
    });
    t.after(f.dispose);
    const state = f.resource(f.state.roots.session);
    assert.equal(state.status, 'pending');
    assert.deepEqual(state.tasks, [{ key }]);
    assert.equal(state.currentTask.key, key);
  });
}

test('a session without user identity denies authorization', async t => {
  const session = { ...sessionFixture(), user: null, factor_verification_age: [0, 0] };
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  session.last_active_token = {
    object: 'token',
    jwt: `${encode({ alg: 'none' })}.${encode({ iat: now, exp: now + 3600, sid: session.id, fea: 'u:dashboard', pla: 'u:plus' })}.fixture`,
  };
  const f = await fixture({ client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id } });
  t.after(f.dispose);
  assert.equal(f.resource(f.state.roots.user).id, '');
  for (const params of [
    { $case: 2, value: { feature: 'dashboard' } },
    { $case: 3, value: { plan: 'plus' } },
    { $case: 4, value: { reverification: { $case: 1, value: 'strict' } } },
  ]) {
    const result = await f.invoke(f.state.roots.session, 'Session.checkAuthorization', [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result, false);
  }
});
