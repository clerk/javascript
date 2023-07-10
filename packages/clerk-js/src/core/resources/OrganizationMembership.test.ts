import { OrganizationMembership } from './internal';

describe('OrganizationMembership', () => {
  it('has the same initial properties', () => {
    const organizationMemberShip = new OrganizationMembership({
      object: 'organization_membership',
      id: 'test_id',
      created_at: 12345,
      updated_at: 5678,
      role: 'admin',
      organization: {
        id: 'test_org_id',
        logo_url: 'https://path-to-logo.png',
        image_url: 'https://clerk.com',
        name: 'test_name',
        slug: 'test_slug',
        public_metadata: { public: 'metadata' },
        object: 'organization',
        created_at: 12345,
        updated_at: 67890,
        members_count: 1,
        pending_invitations_count: 10,
        admin_delete_enabled: true,
        max_allowed_memberships: 3,
      },
      public_metadata: {
        foo: 'bar',
      },
      public_user_data: {
        object: 'public_user_data',
        first_name: 'test_first_name',
        last_name: 'test_last_name',
        profile_image_url: 'test_url',
        image_url: 'https://clerk.com',
        identifier: 'test@identifier.gr',
        id: 'test_user_id',
      },
    });

    expect(organizationMemberShip).toMatchSnapshot();
  });
});
