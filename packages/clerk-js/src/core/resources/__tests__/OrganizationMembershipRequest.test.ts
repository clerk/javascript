import { OrganizationMembershipRequest } from '../internal';

describe('OrganizationMembership', () => {
  it('has the same initial properties', () => {
    const organizationMembershipRequest = new OrganizationMembershipRequest({
      object: 'organization_membership_request',
      id: 'test_id',
      organization_id: 'test_org_id',
      status: 'pending',
      created_at: 12345,
      updated_at: 5678,
      public_user_data: {
        object: 'public_user_data',
        first_name: 'test_first_name',
        last_name: 'test_last_name',
        image_url: 'https://clerk.com',
        identifier: 'test@identifier.gr',
        id: 'test_user_id',
        has_image: true,
      },
    });

    expect(organizationMembershipRequest).toMatchSnapshot();
  });
});
