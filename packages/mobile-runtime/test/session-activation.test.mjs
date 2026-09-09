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

test('rejected organization activation preserves session organization', async t => {
  const session = sessionFixture();
  session.last_active_organization_id = 'org_previous';
  session.user.organization_memberships = [membership('org_previous'), membership('org_rejected')];
  const f = await fixture({
    client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
    http: request => {
      if (new URL(request.url).pathname.endsWith('/touch'))
        return response(null, {
          status: 403,
          body: JSON.stringify({ errors: [{ code: 'not_a_member_in_organization', message: 'Unable to switch' }] }),
        });
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const result = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [
    { organization: { $case: 0, value: 'org_rejected' } },
  ]);
  assert.equal(result.failure?.status, 403);
  assert.equal(result.failure?.errors[0].code, 'not_a_member_in_organization');
  assert.equal(f.resource(handle).lastActiveOrganizationId, 'org_previous');
  assert.equal(f.resource(f.state.roots.organization).id, 'org_previous');
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
