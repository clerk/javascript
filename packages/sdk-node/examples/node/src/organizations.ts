import { organizations, users } from '@clerk/clerk-sdk-node';

console.log('Get user to create organization');
const userList = await users.getUserList();
const creator = userList[0];

console.log('Create organization');
const organization = await organizations.createOrganization({
  name: 'test-organization',
  createdBy: creator.id,
});
console.log(organization);

console.log('Update organization metadata');
const updatedOrganizationMetadata = await organizations.updateOrganizationMetadata(
  organization.id,
  {
    publicMetadata: { test: 1 },
  },
);

console.log(updatedOrganizationMetadata);
