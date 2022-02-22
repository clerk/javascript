import { OrganizationMembership } from 'core/resources/internal';

describe('OrganizationMembership', () => {
  it('has the same initial properties', () => {
    const organizationMemberShip = new OrganizationMembership({
      object: 'organization_membership',
      id: 'test_id',
      user_id: 'test_user_id',
      organization_id: 'test_organization_id',
      created_at: 12345,
      updated_at: 5678,
      role: 'admin',
    });

    expect(organizationMemberShip).toMatchSnapshot();
  });
});
