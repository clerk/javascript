import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const organization = {
  object: 'organization',
  id: 'org_contract',
  name: 'My Org',
  slug: 'my-org',
  image_url: '',
  has_image: false,
  public_metadata: {},
  created_at: 1700000000000,
  updated_at: 1700000000000,
};

for (const slug of [undefined, 'my-org']) {
  test(`generated organization creation preserves name and ${slug ? 'explicit' : 'omitted'} slug`, async t => {
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (new URL(request.url).pathname.endsWith('/organizations')) return response(organization);
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.createOrganization', [
      { name: 'My Org', ...(slug === undefined ? {} : { slug }) },
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result));
    const created = f.resource(result.result.$ref);
    assert.equal(created.id, organization.id);
    assert.equal(created.name, organization.name);
    const request = f.requests.find(value => new URL(value.url).pathname.endsWith('/organizations'));
    assert.equal(request.method, 'POST');
    const body = new URLSearchParams(request.body);
    assert.equal(body.get('name'), 'My Org');
    assert.equal(body.get('slug'), slug ?? null);
  });
}

test('generated organization lookup returns the requested organization resource', async t => {
  const f = await fixture({
    client: fixtures.authenticatedClient,
    http: request => {
      if (new URL(request.url).pathname.endsWith(`/organizations/${organization.id}`)) return response(organization);
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.clerk, 'Clerk.getOrganization', [organization.id]);
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(f.resource(result.result.$ref).id, organization.id);
  assert.equal(f.resource(result.result.$ref).name, organization.name);
  const request = f.requests.find(value => new URL(value.url).pathname.endsWith(`/organizations/${organization.id}`));
  assert.equal(request.method, 'GET');
});

for (const outcome of ['receipt', 'resource', 'rejected']) {
  test(`generated membership deletion returns its declared resource: ${outcome}`, async t => {
    const member = {
      object: 'organization_membership',
      id: 'orgmem_contract',
      organization,
      role: 'org:member',
      role_name: 'Member',
      permissions: [],
      public_metadata: { source: 'before' },
      created_at: 1700000000000,
      updated_at: 1700000000000,
      public_user_data: {
        user_id: 'user_native',
        first_name: 'Test',
        last_name: 'User',
        image_url: '',
        has_image: false,
        identifier: 'test@example.com',
      },
    };
    const client = structuredClone(fixtures.authenticatedClient);
    client.sessions[0].user.organization_memberships = [member];
    client.sessions[0].last_active_organization_id = organization.id;
    const f = await fixture({
      client,
      http: request => {
        const url = new URL(request.url);
        if (!url.pathname.includes('/memberships/')) return;
        assert.equal(url.pathname, `/v1/organizations/${organization.id}/memberships/user_native`);
        assert.equal(url.searchParams.get('_method') ?? request.method, 'DELETE');
        assert.equal(url.searchParams.get('_clerk_session_id'), 'sess_native');
        if (outcome === 'rejected')
          return response(null, {
            status: 403,
            body: JSON.stringify({
              errors: [{ code: 'not_allowed_access', message: 'Not allowed', long_message: 'Not allowed', meta: {} }],
            }),
          });
        client.sessions[0].user.organization_memberships = [];
        client.sessions[0].last_active_organization_id = null;
        const returned =
          outcome === 'receipt'
            ? { object: member.object, id: member.id, deleted: true }
            : { ...member, public_metadata: { source: 'server' }, updated_at: 1700000001000 };
        return response(null, { body: JSON.stringify({ response: returned, client }) });
      },
    });
    t.after(f.dispose);
    assert.equal(f.state.roots.organization.type, 'Organization');
    const before = f.resource(f.state.roots.user).organizationMemberships[0].$ref;
    const result = await f.invoke(before, 'OrganizationMembership.destroy');
    if (outcome === 'rejected') {
      assert.equal(result.failure.errors[0].code, 'not_allowed_access');
      assert.equal(f.resource(f.state.roots.user).organizationMemberships.length, 1);
      assert.equal(f.resource(f.state.roots.organization).id, organization.id);
      return;
    }
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const removed = f.resource(result.result.$ref);
    assert.equal(removed.id, member.id);
    assert.equal(removed.role, 'org:member');
    assert.equal(removed.publicMetadata.source, outcome === 'receipt' ? 'before' : 'server');
    assert.equal(f.resource(removed.organization.$ref).name, organization.name);
    assert.deepEqual(f.resource(f.state.roots.user).organizationMemberships, []);
    assert.equal(f.state.roots.organization, null);
    assert.equal(
      f.messages.some(message => message.kind === 'runtimeError'),
      false,
    );
  });
}
