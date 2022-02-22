import { OrganizationInvitation } from 'core/resources/internal';

describe('OrganizationInvitation', () => {
  it('has the same initial properties', () => {
    const organizationInvitation = new OrganizationInvitation({
      object: 'organization_invitation',
      email_address: 'test_email',
      id: 'test_id',
      created_at: 12345,
      updated_at: 5678,
      status: 'pending',
    });

    expect(organizationInvitation).toMatchSnapshot();
  });
});
