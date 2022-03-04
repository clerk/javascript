import { OrganizationMembership } from 'core/resources/internal';

describe('OrganizationMembership', () => {
  it('has the same initial properties', () => {
    const organizationMemberShip = new OrganizationMembership({
      object: 'organization_membership',
      id: 'test_id',
      organization_id: 'test_org_id',
      created_at: 12345,
      updated_at: 5678,
      role: 'admin',
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
