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
      role: 'basic_member',
      created_at: 12345,
      updated_at: 5678,
      status: 'pending',
    });

    expect(organizationInvitation).toMatchObject({
      id: 'test_id',
      emailAddress: 'test_email',
      organizationId: 'test_organization_id',
      role: 'basic_member',
      roleName: undefined,
      status: 'pending',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      publicMetadata: {
        public: 'metadata',
      },
    });
  });
});

describe('OrganizationInvitation Snapshots', () => {
  it('should match snapshot for organization invitation structure', () => {
    const organizationInvitation = new OrganizationInvitation({
      object: 'organization_invitation',
      email_address: 'newuser@example.com',
      id: 'invitation_123',
      organization_id: 'org_123',
      public_metadata: {
        department: 'engineering',
        level: 'senior',
      },
      role: 'admin',
      created_at: 1735689600000,
      updated_at: 1735689650000,
      status: 'pending',
    });

    expect(organizationInvitation).toMatchSnapshot();
  });

  it('should match snapshot for minimal organization invitation', () => {
    const organizationInvitation = new OrganizationInvitation({
      object: 'organization_invitation',
      email_address: 'user@company.com',
      id: 'invitation_minimal',
      organization_id: 'org_456',
      public_metadata: {},
      role: 'basic_member',
      created_at: 1735689600000,
      updated_at: 1735689600000,
      status: 'accepted',
    });

    expect(organizationInvitation).toMatchSnapshot();
  });
});
