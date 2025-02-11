import { OrganizationInvitation } from '../internal';

describe('OrganizationInvitation', () => {
  it('has the same initial properties', () => {
    const organizationInvitation = new OrganizationInvitation({
      object: 'organization_invitation',
      email_address: 'test_email',
      id: 'test_id',
      organization_id: 'test_organization_id',
      public_metadata: {
        public: 'metadata',
      },
      private_metadata: {
        private: 'metadata',
      },
      role: 'basic_member',
      created_at: 12345,
      updated_at: 5678,
      expires_at: 12345,
      status: 'pending',
      url: 'url',
    });

    expect(organizationInvitation).toMatchSnapshot();
  });
});
