import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [kind, method] of [
  ['invitation', 'getOrganizationInvitations'],
  ['suggestion', 'getOrganizationSuggestions'],
]) {
  for (const [scenario, image, slug] of [
    ['present image and slug', 'https://fixture.test/logo.png', 'acme'],
    ['null image and slug', null, null],
    ['omitted image and slug', undefined, undefined],
    ['null image and omitted slug', null, undefined],
  ]) {
    test(`organization ${kind}s preserve projected data with ${scenario}`, async t => {
      const f = await fixture({
        client: fixtures.authenticatedClient,
        http: request => {
          if (!request.url.includes(`/organization_${kind}s`)) return;
          return response({
            data: [
              {
                object: `organization_${kind}`,
                id: 'invite_projection',
                email_address: 'sam@example.com',
                public_organization_data: { id: 'org_123', name: 'Acme', has_image: !!image, image_url: image, slug },
                public_metadata: { source: 'test', nested: { retained: null }, count: 3 },
                role: 'org:member',
                status: 'pending',
                created_at: 1713200000000,
                updated_at: '2024-04-15T19:17:53Z',
              },
            ],
            total_count: 1,
          });
        },
      });
      t.after(f.dispose);
      const result = await f.invoke(f.state.roots.user, `User.${method}`, [{}]);
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result.total_count, 1);
      const invitation = f.resource(result.result.data[0].$ref);
      assert.equal(invitation.id, 'invite_projection');
      assert.equal(invitation.publicOrganizationData.imageUrl, image ?? '');
      assert.equal(invitation.publicOrganizationData.slug, slug ?? null);
      assert.equal(invitation.publicOrganizationData.hasImage, !!image);
      assert.equal(invitation.publicOrganizationData.id, 'org_123');
      assert.equal(invitation.publicOrganizationData.name, 'Acme');
      if (kind === 'invitation')
        assert.deepEqual(invitation.publicMetadata, { source: 'test', nested: { retained: null }, count: 3 });
      assert.equal(invitation.createdAt, '2024-04-15T16:53:20.000Z');
      assert.equal(invitation.updatedAt, '2024-04-15T19:17:53.000Z');
      assert.equal(f.requests.filter(request => request.url.includes(`/organization_${kind}s`)).length, 1);
    });
  }
}
