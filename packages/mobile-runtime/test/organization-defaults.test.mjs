import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [scenario, payload] of [
  ['no form', { advisory: null, form: null }],
  [
    'missing advisory severity',
    {
      advisory: {
        code: 'organization_already_exists',
        meta: { organization_domain: 'clerk.dev', organization_name: 'Clerk' },
      },
      form: { name: 'My Organization', slug: 'my-organization', logo: null, blur_hash: null },
    },
  ],
  [
    'partial branding',
    {
      advisory: {
        code: 'organization_already_exists',
        meta: { organization_domain: 'acme.test', organization_name: 'Acme' },
      },
      form: { name: 'Acme', logo: 'https://img.clerk.com/acme.png' },
    },
  ],
  ['missing slug', { advisory: null, form: { name: 'My Organization', logo: null, blur_hash: null } }],
]) {
  test(`generated organization defaults accept ${scenario}`, async t => {
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (new URL(request.url).pathname.endsWith('/organization_creation_defaults')) {
          assert.equal(request.method, 'GET');
          return response(payload);
        }
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.user, 'User.getOrganizationCreationDefaults');
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const value = f.resource(result.result.$ref);
    assert.equal(value.form.name, payload.form?.name ?? '');
    assert.equal(value.form.slug, payload.form?.slug ?? '');
    assert.equal(value.form.logo, payload.form?.logo ?? null);
    assert.equal(value.form.blurHash, null);
    if (payload.advisory) {
      assert.equal(value.advisory.code, payload.advisory.code);
      assert.equal(value.advisory.severity, 'warning');
      assert.deepEqual(value.advisory.meta, payload.advisory.meta);
    } else assert.equal(value.advisory, null);
  });
}
