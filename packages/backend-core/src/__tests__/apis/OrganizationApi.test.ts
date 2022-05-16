import nock from 'nock';

import {
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipPublicUserData,
} from '../../api/resources';
import { OrganizationInvitationStatus, OrganizationMembershipRole } from '../../api/resources/Enums';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createOrganization() creates an organization', async () => {
  const name = 'Acme Inc';
  const slug = 'acme-inc';
  const createdBy = 'user_randomid';
  const publicMetadata = { public: 'metadata' };
  const privateMetadata = { private: 'metadata' };
  const resJSON = {
    object: 'organization',
    id: 'org_randomid',
    name,
    slug,
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
    new Organization({
      id: resJSON.id,
      name,
      slug,
      publicMetadata,
      privateMetadata,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});

test('updateOrganization() updates organization', async () => {
  const id = 'org_randomid';
  const name = 'New name';
  const resJSON = {
    object: 'organization',
    id,
    name,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev').patch(`/v1/organizations/${id}`, { name }).reply(200, resJSON);

  const organization = await TestBackendAPIClient.organizations.updateOrganization(id, { name });
  expect(organization).toEqual(
    new Organization({
      id,
      name: resJSON.name,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});

test('updateOrganizationMetadata() updates organization metadata', async () => {
  const id = 'org_randomid';
  const publicMetadata = { hello: 'world' };
  const privateMetadata = { goodbye: 'world' };
  const resJSON = {
    object: 'organization',
    id,
    name: 'Org',
    public_metadata: publicMetadata,
    private_metadata: privateMetadata,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock('https://api.clerk.dev')
    .patch(`/v1/organizations/${id}/metadata`, {
      public_metadata: JSON.stringify(publicMetadata),
      private_metadata: JSON.stringify(privateMetadata),
    })
    .reply(200, resJSON);

  const organization = await TestBackendAPIClient.organizations.updateOrganizationMetadata(id, {
    publicMetadata,
    privateMetadata,
  });
  expect(organization).toEqual(
    new Organization({
      id,
      name: resJSON.name,
      publicMetadata,
      privateMetadata,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});

test('deleteOrganization() deletes organization', async () => {
  const id = 'org_randomid';
  nock('https://api.clerk.dev').delete(`/v1/organizations/${id}`).reply(200, {});
  await TestBackendAPIClient.organizations.deleteOrganization(id);
});

test('getOrganizationMembershipList() returns a list of organization memberships', async () => {
  const organizationId = 'org_randomid';
  const resJSON = [
    {
      object: 'organization_membership',
      id: 'orgmem_randomid',
      role: 'basic_member',
      organization: {
        object: 'organization',
        id: organizationId,
        name: 'Acme Inc',
        slug: 'acme-inc',
        created_at: 1612378465,
        updated_at: 1612378465,
      },
      public_user_data: {
        first_name: 'John',
        last_name: 'Doe',
        profile_image_url: 'https://url-to-image.png',
        identifier: 'johndoe@example.com',
        user_id: 'user_randomid',
      },
      created_at: 1612378465,
      updated_at: 1612378465,
    },
  ];

  nock('https://api.clerk.dev')
    .get(new RegExp(`/v1/organizations/${organizationId}/memberships`))
    .reply(200, resJSON);

  const organizationMembershipList = await TestBackendAPIClient.organizations.getOrganizationMembershipList({
    organizationId,
  });
  expect(organizationMembershipList).toBeInstanceOf(Array);
  expect(organizationMembershipList.length).toEqual(1);
  expect(organizationMembershipList[0]).toBeInstanceOf(OrganizationMembership);
  expect(organizationMembershipList[0].organization).toBeInstanceOf(Organization);
  expect(organizationMembershipList[0].publicUserData).toBeInstanceOf(OrganizationMembershipPublicUserData);
});

test('createOrganizationMembership() creates a membership for an organization', async () => {
  const organizationId = 'org_randomid';
  const userId = 'user_randomid';
  const role: OrganizationMembershipRole = 'basic_member';
  const resJSON = {
    object: 'organization_membership',
    id: 'orgmem_randomid',
    role,
    organization: {
      object: 'organization',
      id: organizationId,
      name: 'Acme Inc',
      slug: 'acme-inc',
      public_metadata: {},
      private_metadata: {},
      created_at: 1612378465,
      updated_at: 1612378465,
    },
    public_user_data: {
      first_name: 'John',
      last_name: 'Doe',
      profile_image_url: 'https://url-to-image.png',
      identifier: 'johndoe@example.com',
      user_id: userId,
    },
    created_at: 1612378465,
    updated_at: 1612378465,
  };

  nock('https://api.clerk.dev').post(`/v1/organizations/${organizationId}/memberships`).reply(200, resJSON);

  const orgMembership = await TestBackendAPIClient.organizations.createOrganizationMembership({
    organizationId,
    userId,
    role,
  });
  expect(orgMembership).toEqual(
    new OrganizationMembership({
      id: resJSON.id,
      role: resJSON.role,
      organization: new Organization({
        id: resJSON.organization.id,
        name: resJSON.organization.name,
        slug: resJSON.organization.slug,
        publicMetadata: resJSON.organization.public_metadata,
        privateMetadata: resJSON.organization.private_metadata,
        createdAt: resJSON.organization.created_at,
        updatedAt: resJSON.organization.updated_at,
      }),
      publicUserData: new OrganizationMembershipPublicUserData({
        identifier: resJSON.public_user_data.identifier,
        firstName: resJSON.public_user_data.first_name,
        lastName: resJSON.public_user_data.last_name,
        profileImageUrl: resJSON.public_user_data.profile_image_url,
        userId: resJSON.public_user_data.user_id,
      }),
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});

test('updateOrganizationMembership() updates an organization membership', async () => {
  const organizationId = 'org_randomid';
  const userId = 'user_randomid';
  const role: OrganizationMembershipRole = 'basic_member';
  const resJSON = {
    object: 'organization_membership',
    id: 'orgmem_randomid',
    role,
    organization: {
      object: 'organization',
      id: organizationId,
      name: 'Acme Inc',
      slug: 'acme-inc',
      public_metadata: {},
      private_metadata: {},
      created_at: 1612378465,
      updated_at: 1612378465,
    },
    public_user_data: {
      first_name: 'John',
      last_name: 'Doe',
      profile_image_url: 'https://url-to-image.png',
      identifier: 'johndoe@example.com',
      user_id: userId,
    },
    created_at: 1612378465,
    updated_at: 1612378465,
  };

  nock('https://api.clerk.dev').patch(`/v1/organizations/${organizationId}/memberships/${userId}`).reply(200, resJSON);

  const orgMembership = await TestBackendAPIClient.organizations.updateOrganizationMembership({
    organizationId,
    userId,
    role,
  });
  expect(orgMembership).toEqual(
    new OrganizationMembership({
      id: resJSON.id,
      role: resJSON.role,
      organization: new Organization({
        id: resJSON.organization.id,
        name: resJSON.organization.name,
        slug: resJSON.organization.slug,
        publicMetadata: resJSON.organization.public_metadata,
        privateMetadata: resJSON.organization.private_metadata,
        createdAt: resJSON.organization.created_at,
        updatedAt: resJSON.organization.updated_at,
      }),
      publicUserData: new OrganizationMembershipPublicUserData({
        identifier: resJSON.public_user_data.identifier,
        firstName: resJSON.public_user_data.first_name,
        lastName: resJSON.public_user_data.last_name,
        profileImageUrl: resJSON.public_user_data.profile_image_url,
        userId: resJSON.public_user_data.user_id,
      }),
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});

test('deleteOrganizationMembership() deletes an organization', async () => {
  const organizationId = 'org_randomid';
  const userId = 'user_randomid';
  nock('https://api.clerk.dev').delete(`/v1/organizations/${organizationId}/memberships/${userId}`).reply(200, {});
  await TestBackendAPIClient.organizations.deleteOrganizationMembership({ organizationId, userId });
});

test('createOrganizationInvitation() creates an invitation for an organization', async () => {
  const organizationId = 'org_randomid';
  const role: OrganizationMembershipRole = 'basic_member';
  const status: OrganizationInvitationStatus = 'pending';
  const emailAddress = 'invitation@example.com';
  const redirectUrl = 'https://example.com';
  const resJSON = {
    object: 'organization_invitation',
    id: 'orginv_randomid',
    role,
    status,
    email_address: emailAddress,
    redirect_url: redirectUrl,
    organization_id: organizationId,
    created_at: 1612378465,
    updated_at: 1612378465,
  };

  nock('https://api.clerk.dev').post(`/v1/organizations/${organizationId}/invitations`).reply(200, resJSON);

  const orgInvitation = await TestBackendAPIClient.organizations.createOrganizationInvitation({
    organizationId,
    emailAddress,
    role,
    redirectUrl,
    inviterUserId: 'user_randomid',
  });
  expect(orgInvitation).toEqual(
    new OrganizationInvitation({
      id: resJSON.id,
      role: resJSON.role,
      organizationId,
      emailAddress,
      redirectUrl,
      status: resJSON.status,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    }),
  );
});
