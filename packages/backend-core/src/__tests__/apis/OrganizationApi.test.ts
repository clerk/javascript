import nock from 'nock';

import { Organization } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createOrganization() creates an organization', async () => {
  const name = 'Acme Inc';
  const createdBy = 'user_randomid';
  const resJSON = {
    object: 'organization',
    id: 'org_randomid',
    name,
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
  expect(organization).toEqual(
    new Organization({
      id: resJSON.id,
      name,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});
