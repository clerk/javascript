import { describe, expect, it } from 'vitest';

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
