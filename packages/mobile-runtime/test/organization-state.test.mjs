import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const permissions = [
  'custom:permission',
  'org:sys_profile:manage',
  'org:sys_profile:delete',
  'org:sys_memberships:read',
  'org:sys_memberships:manage',
  'org:sys_domains:read',
  'org:sys_domains:manage',
  'org:sys_billing:read',
  'org:sys_billing:manage',
  'org:sys_api_keys:read',
  'org:sys_api_keys:manage',
];
function clientFixture(active = 'org_active', permissionScenario = 'present') {
  const client = structuredClone(fixtures.authenticatedClient);
  const session = client.sessions[0];
  session.last_active_organization_id = active;
  session.user.organization_memberships = ['other', 'active'].map(name => ({
    object: 'organization_membership',
    id: `orgmem_${name}`,
    role: 'org:admin',
    role_name: 'Admin',
    ...(permissionScenario === 'omitted' ? {} : { permissions: permissionScenario === 'null' ? null : permissions }),
    public_metadata: {},
    created_at: 1713200000000,
    updated_at: 1713200000000,
    organization: {
      object: 'organization',
      id: `org_${name}`,
      name,
      slug: name,
      image_url: '',
      has_image: false,
      public_metadata: {},
      created_at: 1713200000000,
      updated_at: 1713200000000,
    },
  }));
  return client;
}
for (const scenario of ['present', 'null', 'omitted']) {
  test(`organization membership permissions preserve ${scenario} server values`, async t => {
    const f = await fixture({ client: clientFixture('org_active', scenario) });
    t.after(f.dispose);
    const user = f.resource(f.state.roots.user);
    assert.equal(user.organizationMemberships.length, 2);
    for (const ref of user.organizationMemberships) {
      const member = f.resource(ref.$ref);
      assert.deepEqual(member.permissions, scenario === 'present' ? permissions : []);
      assert.equal(member.role, 'org:admin');
      assert.equal(member.roleName, 'Admin');
    }
  });
}
for (const active of ['org_active', null, 'org_missing']) {
  test(`active organization uses matching membership for ${active}`, async t => {
    const f = await fixture({ client: clientFixture(active) });
    t.after(f.dispose);
    const user = f.resource(f.state.roots.user);
    const members = user.organizationMemberships.map(ref => f.resource(ref.$ref));
    assert.deepEqual(
      members.map(member => f.resource(member.organization.$ref).id),
      ['org_other', 'org_active'],
    );
    assert.equal(f.resource(f.state.roots.session).lastActiveOrganizationId, active);
    if (active === 'org_active') {
      assert.equal(f.resource(f.state.roots.organization).id, active);
      assert.deepEqual(f.state.roots.organization, members[1].organization.$ref);
    } else assert.equal(f.state.roots.organization, null);
  });
}
for (const [mode, status] of [
  ['manual_invitation', 'verified'],
  ['automatic_invitation', 'unverified'],
  ['automatic_suggestion', null],
  ['enterprise_sso', 'expired'],
  ['future_mode', 'future_status'],
]) {
  test(`organization domain preserves ${mode} and ${status}`, async t => {
    let reads = 0;
    const f = await fixture({
      client: clientFixture(),
      http: request => {
        const url = new URL(request.url);
        if (url.pathname !== '/v1/organizations/org_active/domains') return;
        reads++;
        assert.equal(request.method, 'GET');
        assert.equal(url.searchParams.get('_clerk_session_id'), 'sess_native');
        return response({
          data: [
            {
              object: 'organization_domain',
              id: 'orgdom_state',
              organization_id: 'org_active',
              name: 'example.com',
              enrollment_mode: mode,
              verification:
                status === null
                  ? null
                  : {
                      status,
                      strategy: 'email_code',
                      attempts: 0,
                      expires_at: 1713200000000,
                    },
              affiliation_email_address: null,
              total_pending_invitations: 0,
              total_pending_suggestions: 0,
              created_at: 1713200000000,
              updated_at: 1713200000000,
            },
          ],
          total_count: 1,
        });
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.organization, 'Organization.getDomains');
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(reads, 1);
    const domain = f.resource(result.result.data[0].$ref);
    assert.equal(domain.enrollmentMode, mode);
    assert.equal(domain.verification?.status ?? null, status);
    assert.equal(domain.affiliationVerification?.status ?? null, status);
    assert.equal(domain.organizationId, 'org_active');
  });
}
