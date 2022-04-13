import nock from 'nock';

import { ObjectType, Organization, OrganizationJSON } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createOrganization() creates an organization', async () => {
  const name = 'Acme Inc';
  const createdBy = 'user_randomid';
  const resJSON: OrganizationJSON = {
    object: ObjectType.Organization,
    public_metadata: {},
    id: 'org_randomid',
    name,
    logo_url: null,
    slug: null,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev')
    .post('/v1/organizations', {
      name,
      created_by: createdBy,
    })
    .reply(200, resJSON);

  const organization = await TestBackendAPIClient.organizations.createOrganization({
    name,
    createdBy,
  });
  expect(organization).toEqual(new Organization(resJSON.id, name, null, null, resJSON.created_at, resJSON.updated_at));
});
