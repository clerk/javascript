import nock from 'nock';

import { Organization } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createOrganization() creates an organization', async () => {
  const name = 'Acme Inc';
  const createdBy = 'user_randomid';
  const publicMetadata = { public: 'metadata' };
  const privateMetadata = { private: 'metadata' };
  const resJSON = {
    object: 'organization',
    id: 'org_randomid',
    name,
    public_metadata: publicMetadata,
    private_metadata: privateMetadata,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev')
    .post('/v1/organizations', {
      name,
      public_metadata: JSON.stringify(publicMetadata),
      private_metadata: JSON.stringify(privateMetadata),
      created_by: createdBy,
    })
    .reply(200, resJSON);

  const organization = await TestBackendAPIClient.organizations.createOrganization({
    name,
    createdBy,
    publicMetadata,
    privateMetadata,
  });
  expect(organization).toEqual(
    new Organization({
      id: resJSON.id,
      name,
      publicMetadata,
      privateMetadata,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});
