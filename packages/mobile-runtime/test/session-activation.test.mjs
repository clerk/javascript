import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const membership = id => ({
  object: 'organization_membership',
  id: `om_${id}`,
  role: 'org:admin',
  role_name: 'Admin',
  permissions: ['org:read'],
  public_metadata: {},
  created_at: 1700000000000,
  updated_at: 1700000000000,
  organization: {
    object: 'organization',
    id,
    name: id,
    slug: id,
    image_url: '',
    has_image: false,
    public_metadata: {},
    created_at: 1700000000000,
    updated_at: 1700000000000,
  },
});

for (const [status, code] of [
  [401, 'unauthorized_organization'],
  [403, 'not_a_member_in_organization'],
]) {
  test(
    `rejected organization activation preserves session organization and cached token: ${status}`,
    { timeout: 5000 },
    async t => {
      const session = sessionFixture();
      session.last_active_organization_id = 'org_previous';
      session.user.organization_memberships = [membership('org_previous'), membership('org_rejected')];
      let minted = 0;
      const token = tokenFixture();
      const f = await fixture({
        client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
        http: request => {
          if (new URL(request.url).pathname.endsWith('/tokens'))
            return response(token, { body: JSON.stringify(token) });
          if (new URL(request.url).pathname.endsWith('/tokens/firebase')) {
            minted++;
            return response(token, { body: JSON.stringify(token) });
          }
          if (new URL(request.url).pathname.endsWith('/touch'))
            return response(null, {
              status,
              body: JSON.stringify({ errors: [{ code, message: 'Unable to switch' }] }),
            });
        },
      });
      t.after(f.dispose);
      const handle = f.state.roots.session;
      const getToken = () => f.invoke(handle, 'Session.getToken', [{ template: 'firebase' }]);
      assert.equal((await getToken()).result, token.jwt);
      const result = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [
        { organization: { $case: 0, value: 'org_rejected' } },
      ]);
      assert.equal(result.failure?.status, status);
      assert.equal(result.failure?.errors[0].code, code);
      assert.equal(f.resource(handle).lastActiveOrganizationId, 'org_previous');
      assert.equal(f.resource(f.state.roots.organization).id, 'org_previous');
      assert.equal((await getToken()).result, token.jwt);
      assert.equal(minted, 1);
    },
  );
}

test('forced organization selection rejects personal selection without a request', async t => {
  const session = sessionFixture();
  session.last_active_organization_id = 'org_previous';
  session.user.organization_memberships = [membership('org_previous')];
  const f = await fixture({
    client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
    http: request => {
      if (new URL(request.url).pathname.endsWith('/environment'))
        return response({
          ...fixtures.environment,
          organization_settings: { ...fixtures.environment.organization_settings, force_organization_selection: true },
        });
    },
  });
  t.after(f.dispose);
  const count = f.requests.length;
  const result = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [{ organization: null }]);
  assert.equal(result.failure, undefined);
  assert.equal(f.requests.length, count);
  assert.equal(f.resource(f.state.roots.session).lastActiveOrganizationId, 'org_previous');
  assert.equal(f.resource(f.state.roots.organization).id, 'org_previous');
});

test('a retained session reads a fresh template token after accepted organization activation', async t => {
  const session = sessionFixture();
  session.last_active_organization_id = 'org_previous';
  session.user.organization_memberships = [membership('org_previous'), membership('org_next')];
  const client = { ...fixtures.client, sessions: [session], last_active_session_id: session.id };
  const initial = tokenFixture();
  const next = { ...tokenFixture(), jwt: tokenFixture().jwt + '_next' };
  let minted = 0;
  const f = await fixture({
    client,
    http: request => {
      const path = new URL(request.url).pathname;
      if (path.endsWith('/tokens/firebase')) {
        const value = ++minted === 1 ? initial : next;
        return response(value, { body: JSON.stringify(value) });
      }
      if (path.endsWith('/tokens')) return response(null, { body: JSON.stringify(tokenFixture()) });
      if (!path.endsWith('/touch')) return;
      const updated = { ...session, last_active_organization_id: 'org_next' };
      return response(updated, {
        body: JSON.stringify({ response: updated, client: { ...client, sessions: [updated] } }),
      });
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const getToken = () => f.invoke(handle, 'Session.getToken', [{ template: 'firebase' }]);
  assert.equal((await getToken()).result, initial.jwt);
  const result = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [
    { organization: { $case: 0, value: 'org_next' } },
  ]);
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.deepEqual(f.state.roots.session, handle);
  assert.equal(f.resource(handle).lastActiveOrganizationId, 'org_next');
  assert.equal((await getToken()).result, next.jwt);
  assert.equal((await getToken()).result, next.jwt);
  assert.equal(minted, 2);
});

for (const selection of ['org_next', null, undefined]) {
  test(`accepted organization activation preserves canonical option meaning: ${selection}`, async t => {
    const session = sessionFixture();
    session.last_active_organization_id = 'org_previous';
    session.user.organization_memberships = [membership('org_previous'), membership('org_next')];
    const client = { ...fixtures.client, sessions: [session], last_active_session_id: session.id };
    let sent;
    const target = selection === undefined ? 'org_previous' : selection;
    const f = await fixture({
      client,
      http: request => {
        if (new URL(request.url).pathname.endsWith('/tokens'))
          return response(null, { body: JSON.stringify(tokenFixture()) });
        if (!new URL(request.url).pathname.endsWith('/touch')) return;
        sent = Object.fromEntries(new URLSearchParams(request.body));
        const updated = { ...session, last_active_organization_id: target };
        return response(updated, {
          body: JSON.stringify({ response: updated, client: { ...client, sessions: [updated] } }),
        });
      },
    });
    t.after(f.dispose);
    const params =
      selection === undefined ? {} : { organization: selection === null ? null : { $case: 0, value: selection } };
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.deepEqual(sent, {
      active_organization_id: target ?? '',
      intent: selection === undefined ? 'select_session' : 'select_org',
    });
    assert.equal(f.resource(f.state.roots.session).lastActiveOrganizationId, target);
    assert.equal(f.state.roots.organization && f.resource(f.state.roots.organization).id, target);
  });
}

test('a pending rejected switch cannot publish its target or overwrite a newer accepted switch', async t => {
  const session = sessionFixture();
  session.last_active_organization_id = 'org_previous';
  session.user.organization_memberships = [
    membership('org_previous'),
    membership('org_rejected'),
    membership('org_next'),
  ];
  const client = { ...fixtures.client, sessions: [session], last_active_session_id: session.id };
  let started, release;
  const began = new Promise(resolve => {
    started = resolve;
  });
  const gate = new Promise(resolve => {
    release = resolve;
  });
  const f = await fixture({
    client,
    http: async request => {
      if (new URL(request.url).pathname.endsWith('/tokens'))
        return response(null, { body: JSON.stringify(tokenFixture()) });
      if (!new URL(request.url).pathname.endsWith('/touch')) return;
      const requested = new URLSearchParams(request.body).get('active_organization_id');
      if (requested === 'org_rejected') {
        started();
        await gate;
        return response(null, {
          status: 403,
          body: JSON.stringify({ errors: [{ code: 'not_a_member_in_organization', message: 'Unable to switch' }] }),
        });
      }
      assert.equal(requested, 'org_next');
      const updated = { ...session, last_active_organization_id: requested };
      return response(updated, {
        body: JSON.stringify({ response: updated, client: { ...client, sessions: [updated] } }),
      });
    },
  });
  t.after(() => {
    release();
    f.dispose();
  });
  const rejected = f.invoke(f.state.roots.clerk, 'Clerk.setActive', [
    { organization: { $case: 0, value: 'org_rejected' } },
  ]);
  await began;
  // Another generated call publishes a snapshot while the first request is pending.
  await f.invoke(f.state.roots.session, 'Session.checkAuthorization', [{ $case: 0, value: { role: 'org:admin' } }]);
  assert.equal(f.resource(f.state.roots.session).lastActiveOrganizationId, 'org_previous');
  const accepted = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [
    { organization: { $case: 0, value: 'org_next' } },
  ]);
  assert.equal(accepted.failure, undefined, JSON.stringify(accepted.failure));
  release();
  assert.equal((await rejected).failure?.status, 403);
  assert.equal(f.resource(f.state.roots.session).lastActiveOrganizationId, 'org_next');
  assert.equal(f.resource(f.state.roots.organization).id, 'org_next');
});
