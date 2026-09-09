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
