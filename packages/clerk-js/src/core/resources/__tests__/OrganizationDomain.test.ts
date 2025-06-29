import { OrganizationDomain } from '../internal';

describe('OrganizationDomain', () => {
  it('has the same initial properties', () => {
    const organization = new OrganizationDomain({
      object: 'organization_domain',
      id: 'test_domain_id',
      name: 'clerk.com',
      organization_id: 'test_org_id',
      enrollment_mode: 'manual_invitation',
      verification: {
        attempts: 1,
        expires_at: 12345,
        strategy: 'email_code',
        status: 'verified',
      },
      affiliation_email_address: 'some@clerk.com',
      created_at: 12345,
      updated_at: 5678,
      total_pending_invitations: 0,
      total_pending_suggestions: 0,
    });

    expect(organization).toMatchObject({
      id: 'test_domain_id',
      name: 'clerk.com',
      organizationId: 'test_org_id',
      enrollmentMode: 'manual_invitation',
      affiliationEmailAddress: 'some@clerk.com',
      totalPendingInvitations: 0,
      totalPendingSuggestions: 0,
      verification: {
        attempts: 1,
        expiresAt: expect.any(Date),
        status: 'verified',
        strategy: 'email_code',
      },
    });
  });

  it('has the same initial nullable properties', () => {
    const organization = new OrganizationDomain({
      object: 'organization_domain',
      id: 'test_domain_id',
      name: 'clerk.com',
      organization_id: 'test_org_id',
      enrollment_mode: 'manual_invitation',
      verification: null,
      affiliation_email_address: null,
      created_at: 12345,
      updated_at: 5678,
      total_pending_invitations: 0,
      total_pending_suggestions: 0,
    });

    expect(organization).toMatchObject({
      id: 'test_domain_id',
      name: 'clerk.com',
      organizationId: 'test_org_id',
      enrollmentMode: 'manual_invitation',
      affiliationEmailAddress: null,
      totalPendingInvitations: 0,
      totalPendingSuggestions: 0,
      verification: null,
    });
  });
});

describe('OrganizationDomain Snapshots', () => {
  it('should match snapshot for organization domain structure', () => {
    const organizationDomain = new OrganizationDomain({
      object: 'organization_domain',
      id: 'domain_123',
      name: 'acme.com',
      organization_id: 'org_123',
      enrollment_mode: 'automatic_invitation',
      verification: {
        attempts: 1,
        expires_at: 1735689700000,
        strategy: 'email_code',
        status: 'verified',
      },
      affiliation_email_address: 'admin@acme.com',
      created_at: 1735689600000,
      updated_at: 1735689650000,
      total_pending_invitations: 5,
      total_pending_suggestions: 2,
    });

    expect(organizationDomain).toMatchSnapshot();
  });

  it('should match snapshot for organization domain with null verification', () => {
    const organizationDomain = new OrganizationDomain({
      object: 'organization_domain',
      id: 'domain_minimal',
      name: 'example.org',
      organization_id: 'org_456',
      enrollment_mode: 'manual_invitation',
      verification: null,
      affiliation_email_address: null,
      created_at: 1735689600000,
      updated_at: 1735689600000,
      total_pending_invitations: 0,
      total_pending_suggestions: 0,
    });

    expect(organizationDomain).toMatchSnapshot();
  });
});
