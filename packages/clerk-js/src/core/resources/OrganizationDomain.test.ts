import { OrganizationDomain } from './internal';

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
    });

    expect(organization).toMatchSnapshot();
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
    });

    expect(organization).toMatchSnapshot();
  });
});
