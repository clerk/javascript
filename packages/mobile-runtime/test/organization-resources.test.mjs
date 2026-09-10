import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const organization = {
  object: 'organization',
  id: 'org_contract',
  name: 'My Org',
  slug: 'my-org',
  has_image: false,
  public_metadata: {},
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const publicUser = {
  user_id: 'user_native',
  first_name: 'Test',
  last_name: 'User',
  image_url: '',
  has_image: false,
  identifier: 'test@example.com',
};
const member = {
  object: 'organization_membership',
  id: 'orgmem_contract',
  organization,
  role: 'org:member',
  role_name: 'Member',
  permissions: ['org:custom:permission'],
  public_metadata: {},
  public_user_data: publicUser,
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const role = {
  object: 'role',
  id: 'role_contract',
  key: 'org:member',
  name: 'Member',
  description: 'Organization member',
  permissions: [],
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const invitation = {
  object: 'organization_invitation',
  id: 'orginv_contract',
  organization_id: organization.id,
  email_address: 'invitee@example.com',
  role: 'org:member',
  role_name: 'Member',
  status: 'pending',
  public_metadata: {},
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const domain = {
  object: 'organization_domain',
  id: 'orgdom_contract',
  organization_id: organization.id,
  name: 'example.com',
  enrollment_mode: 'manual_invitation',
  verification: null,
  affiliation_email_address: null,
  total_pending_invitations: 0,
  total_pending_suggestions: 0,
  created_at: 1700000000000,
  updated_at: 1700000000000,
};
const membershipRequest = {
  object: 'organization_membership_request',
  id: 'orgreq_contract',
  organization_id: organization.id,
  status: 'pending',
  public_user_data: publicUser,
  created_at: 1700000000000,
  updated_at: 1700000000000,
};

function authenticatedClient() {
  const client = structuredClone(fixtures.authenticatedClient);
  client.sessions[0].user.organization_memberships = [structuredClone(member)];
  client.sessions[0].last_active_organization_id = organization.id;
  return client;
}

for (const [method, collection, data, params, filters] of [
  ['getRoles', 'roles', role, { initialPage: 2, pageSize: 10 }, {}],
  ['getMemberships', 'memberships', member, { initialPage: 3, pageSize: 10 }, { paginated: ['true'] }],
  [
    'getMemberships',
    'memberships',
    member,
    { initialPage: 3, pageSize: 10, query: 'test' },
    { query: ['test'], paginated: ['true'] },
  ],
  [
    'getMemberships',
    'memberships',
    member,
    { initialPage: 4, pageSize: 10, role: ['org:admin', 'org:member'] },
    { role: ['org:admin', 'org:member'], paginated: ['true'] },
  ],
  ['getInvitations', 'invitations', invitation, { initialPage: 2, pageSize: 10, status: [] }, { status: [] }],
  [
    'getInvitations',
    'invitations',
    invitation,
    { initialPage: 4, pageSize: 10, status: ['pending'] },
    { status: ['pending'] },
  ],
  [
    'getInvitations',
    'invitations',
    invitation,
    { initialPage: 2, pageSize: 10, status: ['pending', 'accepted'] },
    { status: ['pending', 'accepted'] },
  ],
  ['getDomains', 'domains', domain, { initialPage: 2, pageSize: 10 }, {}],
  [
    'getDomains',
    'domains',
    domain,
    { initialPage: 2, pageSize: 10, enrollmentMode: 'automatic_invitation' },
    { enrollment_mode: ['automatic_invitation'] },
  ],
  [
    'getDomains',
    'domains',
    domain,
    { initialPage: 3, pageSize: 10, enrollmentMode: 'automatic_suggestion' },
    { enrollment_mode: ['automatic_suggestion'] },
  ],
  ['getMembershipRequests', 'membership_requests', membershipRequest, { initialPage: 2, pageSize: 10 }, {}],
  [
    'getMembershipRequests',
    'membership_requests',
    membershipRequest,
    { initialPage: 4, pageSize: 10, status: 'pending' },
    { status: ['pending'] },
  ],
]) {
  test(`generated organization ${method} preserves filters ${JSON.stringify(filters)}`, async t => {
    const f = await fixture({
      client: authenticatedClient(),
      http: request => {
        const url = new URL(request.url);
        if (!url.pathname.endsWith(`/${collection}`)) return;
        return response({
          data: [data],
          total_count: 31,
          ...(method === 'getRoles' ? { has_role_set_migration: true } : {}),
        });
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.organization, `Organization.${method}`, [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const request = f.requests.find(r => new URL(r.url).pathname.endsWith(`/${collection}`));
    const url = new URL(request.url);
    assert.equal(url.pathname, `/v1/organizations/${organization.id}/${collection}`);
    assert.equal(request.method, 'GET');
    assert.equal(url.searchParams.get('offset'), String((params.initialPage - 1) * params.pageSize));
    assert.equal(url.searchParams.get('limit'), '10');
    assert.equal(url.searchParams.get('_clerk_session_id'), 'sess_native');
    for (const key of ['query', 'role', 'paginated', 'status', 'enrollment_mode'])
      assert.deepEqual(url.searchParams.getAll(key), filters[key] ?? []);
    assert.equal(result.result.total_count, 31);
    assert.equal(f.resource(result.result.data[0].$ref).id, data.id);
    if (method === 'getRoles') assert.equal(result.result.has_role_set_migration, true);
    if (method === 'getDomains') assert.equal(f.resource(result.result.data[0].$ref).verification, null);
  });
}

for (const outcome of ['receipt', 'resource', 'rejected']) {
  test(`generated logo removal returns a usable organization: ${outcome}`, async t => {
    const client = authenticatedClient();
    client.sessions[0].user.organization_memberships[0].organization = {
      ...organization,
      image_url: 'https://images.example/logo.png',
      has_image: true,
    };
    const f = await fixture({
      client,
      http: request => {
        const url = new URL(request.url);
        if (url.pathname.endsWith('/logo')) {
          assert.equal(url.pathname, `/v1/organizations/${organization.id}/logo`);
          assert.equal(url.searchParams.get('_method') ?? request.method, 'DELETE');
          if (outcome === 'rejected')
            return response(null, {
              status: 403,
              body: JSON.stringify({ errors: [{ code: 'not_allowed_access', message: 'Not allowed' }] }),
            });
          return response(
            outcome === 'receipt' ? { object: 'image', id: 'logo_contract', deleted: true } : organization,
          );
        }
        if (url.pathname === `/v1/organizations/${organization.id}`) {
          assert.equal(request.method, 'GET');
          return response(organization);
        }
      },
    });
    t.after(f.dispose);
    const handle = f.state.roots.organization;
    const result = await f.invoke(handle, 'Organization.setLogo', [{ file: null }]);
    if (outcome === 'rejected') {
      assert.equal(result.failure.errors[0].code, 'not_allowed_access');
      assert.equal(f.resource(handle).hasImage, true);
      return;
    }
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const value = f.resource(result.result.$ref);
    assert.equal(value.id, organization.id);
    assert.equal(value.name, organization.name);
    assert.equal(value.hasImage, false);
    assert.equal(value.imageUrl, '');
  });
}

test('a separately fetched organization does not alias an older active root', async t => {
  const f = await fixture({
    client: authenticatedClient(),
    http: request => {
      const url = new URL(request.url);
      if (url.pathname === `/v1/organizations/${organization.id}`) {
        return response({
          ...organization,
          name: request.method === 'GET' ? 'Fetched organization' : 'Updated fetched organization',
        });
      }
    },
  });
  t.after(f.dispose);
  const root = f.state.roots.organization;
  const fetched = await f.invoke(f.state.roots.clerk, 'Clerk.getOrganization', [organization.id]);
  assert.equal(fetched.failure, undefined, JSON.stringify(fetched.failure));
  const returned = fetched.result.$ref;
  assert.equal(f.resource(returned).name, 'Fetched organization');
  assert.notDeepEqual(returned, root);
  assert.equal(f.resource(root).name, organization.name);
  const updated = await f.invoke(returned, 'Organization.update', [{ name: 'Updated fetched organization' }]);
  assert.equal(updated.failure, undefined, JSON.stringify(updated.failure));
  assert.equal(f.resource(returned).name, 'Updated fetched organization');
  assert.equal(f.resource(root).name, organization.name);
});

test('organization enrollment modes preserve future output values but reject unknown query input', async t => {
  const f = await fixture({
    client: authenticatedClient(),
    http: request =>
      new URL(request.url).pathname.endsWith('/domains')
        ? response({ data: [{ ...domain, enrollment_mode: 'future_mode' }], total_count: 1 })
        : undefined,
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.organization, 'Organization.getDomains');
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(f.resource(result.result.data[0].$ref).enrollmentMode, 'future_mode');
  const before = f.requests.length;
  const rejected = await f.invoke(f.state.roots.organization, 'Organization.getDomains', [
    { enrollmentMode: 'future_mode' },
  ]);
  assert.equal(rejected.failure.code, 'invalid_bridge_value');
  assert.equal(f.requests.length, before);
});

const prefix = `/v1/organizations/${organization.id}`;
const mutations = [
  [
    'Organization.update',
    [{ name: 'Renamed' }],
    prefix,
    'PATCH',
    { name: ['Renamed'] },
    { ...organization, name: 'Renamed' },
  ],
  [
    'Organization.update',
    [{ name: 'Renamed', slug: 'new-slug' }],
    prefix,
    'PATCH',
    { name: ['Renamed'], slug: ['new-slug'] },
    { ...organization, name: 'Renamed', slug: 'new-slug' },
  ],
  ['Organization.destroy', [], prefix, 'DELETE', {}, { object: 'organization', id: organization.id, deleted: true }],
  [
    'Clerk.createOrganization',
    [{ name: 'New organization' }],
    '/v1/organizations',
    'POST',
    { name: ['New organization'] },
    { ...organization, id: 'org_new', name: 'New organization' },
  ],
  [
    'Clerk.createOrganization',
    [{ name: 'New organization', slug: 'new-slug' }],
    '/v1/organizations',
    'POST',
    { name: ['New organization'], slug: ['new-slug'] },
    { ...organization, id: 'org_new', name: 'New organization', slug: 'new-slug' },
  ],
  [
    'Organization.addMember',
    [{ userId: 'user_123', role: 'org:member' }],
    `${prefix}/memberships`,
    'POST',
    { user_id: ['user_123'], role: ['org:member'] },
    member,
  ],
  [
    'Organization.updateMember',
    [{ userId: 'user_123', role: 'org:admin' }],
    `${prefix}/memberships/user_123`,
    'PATCH',
    { role: ['org:admin'] },
    { ...member, role: 'org:admin' },
  ],
  ['Organization.removeMember', ['user_123'], `${prefix}/memberships/user_123`, 'DELETE', {}, member],
  [
    'Organization.inviteMember',
    [{ emailAddress: 'invitee@example.com', role: 'org:member' }],
    `${prefix}/invitations`,
    'POST',
    { email_address: ['invitee@example.com'], role: ['org:member'] },
    invitation,
  ],
  [
    'Organization.inviteMembers',
    [{ emailAddresses: ['invitee@example.com', 'second@example.com'], role: 'org:member' }],
    `${prefix}/invitations/bulk`,
    'POST',
    { email_address: ['invitee@example.com', 'second@example.com'], role: ['org:member'] },
    [invitation, { ...invitation, id: 'orginv_second', email_address: 'second@example.com' }],
  ],
  ['Organization.createDomain', ['example.com'], `${prefix}/domains`, 'POST', { name: ['example.com'] }, domain],
  ['Organization.getDomain', [{ domainId: domain.id }], `${prefix}/domains/${domain.id}`, 'GET', {}, domain],
  [
    'OrganizationDomain.prepareAffiliationVerification',
    [{ affiliationEmailAddress: 'user@example.com' }],
    `${prefix}/domains/${domain.id}/prepare_affiliation_verification`,
    'POST',
    { affiliation_email_address: ['user@example.com'] },
    {
      ...domain,
      affiliation_email_address: 'user@example.com',
      verification: { status: 'unverified', strategy: 'email_code', attempts: 0, expires_at: 1700000600000 },
    },
  ],
  [
    'OrganizationDomain.attemptAffiliationVerification',
    [{ code: '123456' }],
    `${prefix}/domains/${domain.id}/attempt_affiliation_verification`,
    'POST',
    { code: ['123456'] },
    { ...domain, verification: { status: 'verified', strategy: 'email_code', attempts: 1, expires_at: 1700000600000 } },
  ],
  ...[undefined, true, false].map(deletePending => [
    'OrganizationDomain.updateEnrollmentMode',
    [{ enrollmentMode: 'automatic_invitation', ...(deletePending === undefined ? {} : { deletePending }) }],
    `${prefix}/domains/${domain.id}/update_enrollment_mode`,
    'POST',
    {
      enrollment_mode: ['automatic_invitation'],
      ...(deletePending === undefined ? {} : { delete_pending: [String(deletePending)] }),
    },
    { ...domain, enrollment_mode: 'automatic_invitation' },
  ]),
  [
    'OrganizationDomain.delete',
    [],
    `${prefix}/domains/${domain.id}`,
    'DELETE',
    {},
    { object: 'organization_domain', id: domain.id, deleted: true },
  ],
  [
    'OrganizationMembership.update',
    [{ role: 'org:admin' }],
    `${prefix}/memberships/user_native`,
    'PATCH',
    { role: ['org:admin'] },
    { ...member, role: 'org:admin' },
  ],
  [
    'OrganizationInvitation.revoke',
    [],
    `${prefix}/invitations/${invitation.id}/revoke`,
    'POST',
    {},
    { ...invitation, status: 'revoked' },
  ],
  [
    'OrganizationMembershipRequest.accept',
    [],
    `${prefix}/membership_requests/${membershipRequest.id}/accept`,
    'POST',
    {},
    { ...membershipRequest, status: 'accepted' },
  ],
  [
    'OrganizationMembershipRequest.reject',
    [],
    `${prefix}/membership_requests/${membershipRequest.id}/reject`,
    'POST',
    {},
    { ...membershipRequest, status: 'rejected' },
  ],
];

async function mutationTarget(f, operation) {
  const owner = operation.split('.')[0];
  if (owner === 'Clerk') return f.state.roots.clerk;
  if (owner === 'Organization') return f.state.roots.organization;
  const [method, params] = {
    OrganizationDomain: ['getDomain', { domainId: domain.id }],
    OrganizationMembership: ['getMemberships', {}],
    OrganizationInvitation: ['getInvitations', {}],
    OrganizationMembershipRequest: ['getMembershipRequests', {}],
  }[owner];
  const loaded = await f.invoke(f.state.roots.organization, `Organization.${method}`, [params]);
  assert.equal(loaded.failure, undefined, JSON.stringify(loaded.failure));
  return (loaded.result.data?.[0] ?? loaded.result).$ref;
}

function mutationFixtureHTTP(payload, fail, requests) {
  let invoked = false;
  const http = request => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/organizations')) return;
    if (!invoked) {
      if (url.pathname.endsWith('/memberships')) return response({ data: [member], total_count: 1 });
      if (url.pathname.endsWith('/invitations')) return response({ data: [invitation], total_count: 1 });
      if (url.pathname.endsWith('/membership_requests')) return response({ data: [membershipRequest], total_count: 1 });
      if (url.pathname.endsWith(`/domains/${domain.id}`)) return response(domain);
    }
    requests.push(request);
    if (fail)
      return response(null, {
        status: 422,
        headers: { 'clerk-trace-id': 'trace_domain_error' },
        body: JSON.stringify({
          errors: [
            {
              code: 'form_param_format_invalid',
              message: 'Domain request invalid',
              long_message: 'The supplied domain is invalid.',
              meta: { param_name: 'domain' },
            },
          ],
          clerk_trace_id: 'trace_domain_error',
        }),
      });
    return response(payload);
  };
  return {
    http,
    ready: () => {
      invoked = true;
    },
  };
}

for (const [operation, params, requestPath, method, fields, payload] of mutations) {
  test(`generated ${operation} preserves its request and result ${JSON.stringify(params)}`, async t => {
    const requests = [];
    const host = mutationFixtureHTTP(payload, false, requests);
    const f = await fixture({ client: authenticatedClient(), http: host.http });
    t.after(f.dispose);
    const target = await mutationTarget(f, operation);
    host.ready();
    const result = await f.invoke(target, operation, params);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(requests.length, 1);
    const request = requests[0];
    const url = new URL(request.url);
    assert.equal(url.pathname, requestPath);
    assert.equal(url.searchParams.get('_method') ?? request.method, method);
    assert.equal(url.searchParams.get('_clerk_session_id'), 'sess_native');
    const body = new URLSearchParams(request.body ?? '');
    for (const key of new Set([...body.keys(), ...Object.keys(fields)]))
      assert.deepEqual(body.getAll(key), fields[key] ?? []);
    if (operation.endsWith('.destroy') || operation.endsWith('.delete')) {
      assert.equal(f.resource(target).id, payload.id);
    } else {
      const values = Array.isArray(result.result) ? result.result : [result.result];
      const expected = Array.isArray(payload) ? payload : [payload];
      assert.equal(values.length, expected.length);
      for (const [index, value] of values.entries()) {
        const projected = f.resource(value.$ref);
        assert.equal(projected.id, expected[index].id);
        for (const key of ['name', 'slug', 'status', 'role']) {
          if (key in expected[index]) assert.equal(projected[key], expected[index][key]);
        }
        if (expected[index].object === 'organization_domain') {
          assert.equal(projected.enrollmentMode, expected[index].enrollment_mode);
          assert.equal(projected.verification?.status ?? null, expected[index].verification?.status ?? null);
          assert.equal(projected.affiliationEmailAddress, expected[index].affiliation_email_address);
        }
      }
    }
  });
}

for (const mutation of mutations.filter(
  ([operation, params]) =>
    operation === 'Organization.createDomain' ||
    (operation === 'Organization.update' && !params[0].slug) ||
    (operation.startsWith('OrganizationDomain.') &&
      (operation !== 'OrganizationDomain.updateEnrollmentMode' || !('deletePending' in params[0]))),
)) {
  const [operation, params, , , , payload] = mutation;
  test(`generated ${operation} preserves API error detail`, async t => {
    const requests = [];
    const host = mutationFixtureHTTP(payload, true, requests);
    const f = await fixture({ client: authenticatedClient(), http: host.http });
    t.after(f.dispose);
    const target = await mutationTarget(f, operation);
    const before = f.resource(target);
    host.ready();
    const result = await f.invoke(target, operation, params);
    assert.equal(result.failure?.errors[0].code, 'form_param_format_invalid', JSON.stringify(result));
    assert.equal(result.failure.errors[0].message, 'Domain request invalid');
    assert.equal(result.failure.errors[0].meta.paramName, 'domain');
    assert.equal(result.failure.clerkTraceId, 'trace_domain_error');
    assert.equal(requests.length, 1);
    assert.deepEqual(f.resource(target), before);
  });
}

for (const format of ['binary', 'string']) {
  test(`generated organization logo upload preserves ${format} data`, async t => {
    const bytes = Buffer.from([0, 255, 128, 10, 13, 34]);
    const f = await fixture({
      client: authenticatedClient(),
      http: request => {
        if (new URL(request.url).pathname.endsWith('/logo')) {
          return response({ ...organization, has_image: true, image_url: 'https://images.example/new-logo.png' });
        }
      },
    });
    t.after(f.dispose);
    const file =
      format === 'binary'
        ? { $case: 2, value: { name: 'logo.png', contentType: 'image/png', base64: bytes.toString('base64') } }
        : { $case: 0, value: 'data:image/png;base64,' + bytes.toString('base64') };
    const result = await f.invoke(f.state.roots.organization, 'Organization.setLogo', [{ file }]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const request = f.requests.find(r => new URL(r.url).pathname.endsWith('/logo'));
    const url = new URL(request.url);
    assert.equal(url.pathname, `${prefix}/logo`);
    assert.equal(url.searchParams.get('_method') ?? request.method, 'PUT');
    assert.equal(url.searchParams.get('_clerk_session_id'), 'sess_native');
    if (format === 'binary')
      assert.deepEqual(request.body, {
        multipart: [{ name: 'file', filename: 'logo.png', contentType: 'image/png', base64: bytes.toString('base64') }],
      });
    else {
      assert.equal(request.body, file.value);
      assert.equal(request.headers['content-type'], 'application/octet-stream');
    }
    const returned = f.resource(result.result.$ref);
    assert.equal(returned.name, 'My Org');
    assert.equal(returned.hasImage, true);
    assert.equal(returned.imageUrl, 'https://images.example/new-logo.png');
  });
}
