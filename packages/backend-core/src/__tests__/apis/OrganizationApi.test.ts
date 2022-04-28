import nock from 'nock';

import { ObjectType, Organization, OrganizationJSON } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createOrganization() creates an organization', async () => {
  const name = 'Acme Inc';
  const slug = 'acme-inc';
  const createdBy = 'user_randomid';
  const publicMetadata = { public: 'metadata' };
  const privateMetadata = { private: 'metadata' };
  const resJSON: OrganizationJSON = {
    object: ObjectType.Organization,
    id: 'org_randomid',
    name,
    slug,
    logo_url: null,
    public_metadata: publicMetadata,
    private_metadata: privateMetadata,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev')
    .post('/v1/organizations', {
      name,
      slug,
      public_metadata: JSON.stringify(publicMetadata),
      private_metadata: JSON.stringify(privateMetadata),
      created_by: createdBy,
    })
    .reply(200, resJSON);

  const organization = await TestBackendAPIClient.organizations.createOrganization({
    name,
    slug,
    createdBy,
    publicMetadata,
    privateMetadata,
  });
  expect(organization).toEqual(
    new Organization(
      resJSON.id,
      name,
      null,
      null,
      resJSON.created_at,
      resJSON.updated_at,
      publicMetadata,
      privateMetadata,
    ),
  );
});
