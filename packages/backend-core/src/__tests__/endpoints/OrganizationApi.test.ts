import nock from 'nock';

import {
  ObjectType,
  Organization,
  OrganizationInvitation,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembership,
  OrganizationMembershipJSON,
  OrganizationMembershipPublicUserData,
} from '../../api/resources';
import { OrganizationInvitationStatus, OrganizationMembershipRole } from '../../api/resources/Enums';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('getOrganizationList() retrieves a list of organizations', async () => {
  const resJSON = {
    data: [
      {
        object: 'organization',
        id: 'org_randomid',
        name: 'Acme Inc',
        slug: 'acme-inc',
        public_metadata: {},
        private_metadata: {},
        created_at: 1611948436,
        updated_at: 1611948436,
      },
    ],
  };
  nock(defaultServerAPIUrl).get('/v1/organizations?').reply(200, resJSON);

  const organizationList = await TestClerkAPI.organizations.getOrganizationList();
  expect(organizationList).toBeInstanceOf(Array);
  expect(organizationList.length).toEqual(1);
  expect(organizationList[0]).toBeInstanceOf(Organization);
});

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

  nock(defaultServerAPIUrl)
    .post('/v1/organizations', {
      name,
      slug,
      public_metadata: publicMetadata,
      private_metadata: privateMetadata,
      created_by: createdBy,
    })
    .reply(200, resJSON);

  const organization = await TestClerkAPI.organizations.createOrganization({
    name,
    slug,
    createdBy,
    publicMetadata,
    privateMetadata,
  });
  expect(organization).toEqual(Organization.fromJSON(resJSON));
});

test('getOrganization() fetches an organization', async () => {
  const id = 'org_randomid';
  const slug = 'acme-inc';
  const resJSON: OrganizationJSON = {
    object: ObjectType.Organization,
    id,
    slug,
    logo_url: null,
    name: 'Acme Inc',
    public_metadata: {},
    private_metadata: {},
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock(defaultServerAPIUrl).get(`/v1/organizations/${id}`).reply(200, resJSON);

  let organization = await TestClerkAPI.organizations.getOrganization({ organizationId: id });
  expect(organization).toEqual(Organization.fromJSON(resJSON));

  nock(defaultServerAPIUrl).get(`/v1/organizations/${slug}`).reply(200, resJSON);
  organization = await TestClerkAPI.organizations.getOrganization({ slug });
  expect(organization).toEqual(Organization.fromJSON(resJSON));
});

test('updateOrganization() updates organization', async () => {
  const id = 'org_randomid';
  const name = 'New name';
  const slug = 'acme-inc';
  const resJSON: OrganizationJSON = {
    object: ObjectType.Organization,
    id,
    name,
    slug,
    created_at: 1611948436,
    updated_at: 1611948436,
    logo_url: null,
    public_metadata: {},
  };

  nock(defaultServerAPIUrl).patch(`/v1/organizations/${id}`, { name }).reply(200, resJSON);

  const organization = await TestClerkAPI.organizations.updateOrganization(id, { name });
  expect(organization).toEqual(Organization.fromJSON(resJSON));
});

test('updateOrganizationMetadata() updates organization metadata', async () => {
  const id = 'org_randomid';
  const slug = 'acme-inc';
  const publicMetadata = { helloWorld: 42 };
  const privateMetadata = { goodbyeWorld: 42 };
  const resJSON: OrganizationJSON = {
    object: ObjectType.Organization,
    id,
    slug,
    name: 'Org',
    public_metadata: publicMetadata,
    private_metadata: privateMetadata,
    created_at: 1611948436,
    updated_at: 1611948436,
    logo_url: null,
  };

  nock(defaultServerAPIUrl)
    .patch(`/v1/organizations/${id}/metadata`, {
      public_metadata: publicMetadata,
      private_metadata: privateMetadata,
    })
    .reply(200, resJSON);

  const organization = await TestClerkAPI.organizations.updateOrganizationMetadata(id, {
    publicMetadata,
    privateMetadata,
  });
  expect(organization).toEqual(Organization.fromJSON(resJSON));
});

test('deleteOrganization() deletes organization', async () => {
  const id = 'org_randomid';
  nock(defaultServerAPIUrl).delete(`/v1/organizations/${id}`).reply(200, {});
  await TestClerkAPI.organizations.deleteOrganization(id);
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

  nock(defaultServerAPIUrl)
    .get(new RegExp(`/v1/organizations/${organizationId}/memberships`))
    .reply(200, resJSON);

  const organizationMembershipList = await TestClerkAPI.organizations.getOrganizationMembershipList({
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
  const resJSON: OrganizationMembershipJSON = {
    object: ObjectType.OrganizationMembership,
    id: 'orgmem_randomid',
    public_metadata: {},
    private_metadata: {},
    role,
    organization: {
      object: ObjectType.Organization,
      id: organizationId,
      name: 'Acme Inc',
      logo_url: null,
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

  nock(defaultServerAPIUrl).post(`/v1/organizations/${organizationId}/memberships`).reply(200, resJSON);

  const orgMembership = await TestClerkAPI.organizations.createOrganizationMembership({
    organizationId,
    userId,
    role,
  });
  expect(orgMembership).toEqual(OrganizationMembership.fromJSON(resJSON));
});

test('updateOrganizationMembership() updates an organization membership', async () => {
  const organizationId = 'org_randomid';
  const userId = 'user_randomid';
  const role: OrganizationMembershipRole = 'basic_member';
  const resJSON: OrganizationMembershipJSON = {
    object: ObjectType.OrganizationMembership,
    id: 'orgmem_randomid',
    role,
    organization: {
      object: ObjectType.Organization,
      id: organizationId,
      logo_url: null,
      name: 'Acme Inc',
      slug: 'acme-inc',
      public_metadata: {},
      private_metadata: {},
      created_at: 1612378465,
      updated_at: 1612378465,
    },
    public_metadata: {},
    private_metadata: {},
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

  nock(defaultServerAPIUrl).patch(`/v1/organizations/${organizationId}/memberships/${userId}`).reply(200, resJSON);

  const orgMembership = await TestClerkAPI.organizations.updateOrganizationMembership({
    organizationId,
    userId,
    role,
  });
  expect(orgMembership).toEqual(OrganizationMembership.fromJSON(resJSON));
});

test('updateOrganizationMembershipMetadata() updates organization metadata', async () => {
  const organizationId = 'org_randomid';
  const userId = 'user_randomid';
  const publicMetadata = { helloWorld: 42 };
  const privateMetadata = { goodbyeWorld: 42 };
  const resJSON: OrganizationMembershipJSON = {
    object: ObjectType.OrganizationMembership,
    id: 'orgmem_randomid',
    role: 'basic_member',
    organization: {
      object: ObjectType.Organization,
      id: organizationId,
      logo_url: null,
      name: 'Acme Inc',
      slug: 'acme-inc',
      public_metadata: {},
      private_metadata: {},
      created_at: 1612378465,
      updated_at: 1612378465,
    },
    public_metadata: publicMetadata,
    private_metadata: privateMetadata,
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

  nock(defaultServerAPIUrl)
    .patch(`/v1/organizations/${organizationId}/memberships/${userId}/metadata`, {
      public_metadata: publicMetadata,
      private_metadata: privateMetadata,
    })
    .reply(200, resJSON);

  const orgMembership = await TestClerkAPI.organizations.updateOrganizationMembershipMetadata({
    organizationId,
    userId,
    publicMetadata,
    privateMetadata,
  });
  expect(orgMembership).toEqual(OrganizationMembership.fromJSON(resJSON));
});

test('deleteOrganizationMembership() deletes an organization', async () => {
  const organizationId = 'org_randomid';
  const userId = 'user_randomid';
  nock(defaultServerAPIUrl).delete(`/v1/organizations/${organizationId}/memberships/${userId}`).reply(200, {});
  await TestClerkAPI.organizations.deleteOrganizationMembership({ organizationId, userId });
});

test('createOrganizationInvitation() creates an invitation for an organization', async () => {
  const organizationId = 'org_randomid';
  const role: OrganizationMembershipRole = 'basic_member';
  const status: OrganizationInvitationStatus = 'pending';
  const emailAddress = 'invitation@example.com';
  const redirectUrl = 'https://example.com';
  const resJSON: OrganizationInvitationJSON = {
    object: ObjectType.OrganizationInvitation,
    id: 'orginv_randomid',
    role,
    status,
    email_address: emailAddress,
    organization_id: organizationId,
    created_at: 1612378465,
    updated_at: 1612378465,
  };

  nock(defaultServerAPIUrl).post(`/v1/organizations/${organizationId}/invitations`).reply(200, resJSON);

  const orgInvitation = await TestClerkAPI.organizations.createOrganizationInvitation({
    organizationId,
    emailAddress,
    role,
    redirectUrl,
    inviterUserId: 'user_randomid',
  });
  expect(orgInvitation).toEqual(OrganizationInvitation.fromJSON(resJSON));
});

test('getPendingOrganizationInvitationList() returns a list of organization memberships', async () => {
  const organizationId = 'org_randomid';
  const resJSON: OrganizationInvitationJSON[] = [
    {
      object: ObjectType.OrganizationInvitation,
      id: 'orginv_randomid',
      role: 'basic_member',
      email_address: 'invited@example.org',
      organization_id: organizationId,
      status: 'pending',
      created_at: 1612378465,
      updated_at: 1612378465,
    },
  ];

  nock(defaultServerAPIUrl)
    .get(new RegExp(`/v1/organizations/${organizationId}/invitations/pending`))
    .reply(200, resJSON);

  const organizationInvitationList = await TestClerkAPI.organizations.getPendingOrganizationInvitationList({
    organizationId,
  });
  expect(organizationInvitationList).toBeInstanceOf(Array);
  expect(organizationInvitationList.length).toEqual(1);
  expect(organizationInvitationList[0]).toBeInstanceOf(OrganizationInvitation);
});

test('revokeOrganizationInvitation() revokes an organization invitation', async () => {
  const organizationId = 'org_randomid';
  const invitationId = 'orginv_randomid';
  const resJSON: OrganizationInvitationJSON = {
    object: ObjectType.OrganizationInvitation,
    id: invitationId,
    role: 'basic_member',
    email_address: 'invited@example.org',
    organization_id: organizationId,
    status: 'revoked',
    created_at: 1612378465,
    updated_at: 1612378465,
  };
  nock(defaultServerAPIUrl)
    .post(`/v1/organizations/${organizationId}/invitations/${invitationId}/revoke`)
    .reply(200, resJSON);

  const orgInvitation = await TestClerkAPI.organizations.revokeOrganizationInvitation({
    organizationId,
    invitationId,
    requestingUserId: 'user_randomid',
  });
  expect(orgInvitation).toEqual(OrganizationInvitation.fromJSON(resJSON));
});
