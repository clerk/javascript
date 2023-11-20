import { organizations, users } from '@clerk/clerk-sdk-node';

console.log('Get user to create organization');
const { data, errors } = await users.getUserList();
if (errors) {
  throw new Error(errors);
}

const creator = data[0];

console.log('Create organization');
const { data: organization } = await organizations.createOrganization({
  name: 'test-organization',
  createdBy: creator.id,
});
console.log(organization);

console.log('Update organization metadata');
const { data: updatedOrganizationMetadata, errors: uomErrors } = await organizations.updateOrganizationMetadata(
  organization.id,
  {
    publicMetadata: { test: 1 },
  },
);
if (uomErrors) {
  throw new Error(uomErrors);
}

console.log(updatedOrganizationMetadata);
