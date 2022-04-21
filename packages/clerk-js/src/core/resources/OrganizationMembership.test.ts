import { OrganizationMembership } from 'core/resources/internal';

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
        name: 'test_name',
        slug: 'test_slug',
        public_metadata: { public: 'metadata' },
        object: 'organization',
        created_at: 12345,
        updated_at: 67890,
      },
      public_user_data: {
        object: 'public_user_data',
        first_name: 'test_first_name',
        last_name: 'test_last_name',
        profile_image_url: 'test_url',
        identifier: 'test@identifier.gr',
        id: 'test_user_id',
      },
    });

    expect(organizationMemberShip).toMatchSnapshot();
  });
});
