import { describe, expect, it } from 'vitest';

import { Organization } from '../internal';

describe('Organization', () => {
  it('has the same initial properties', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'test_id',
      name: 'test_name',
      public_metadata: { public: 'metadata' },
      slug: 'test_slug',
      image_url:
        'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJ1c2VyXzJKbElJQTN2VXNjWXh1N2VUMnhINmFrTGgxOCIsImluaXRpYWxzIjoiREsifQ?width=160',
      created_at: 12345,
      updated_at: 5678,
      members_count: 1,
      pending_invitations_count: 10,
      admin_delete_enabled: true,
      max_allowed_memberships: 3,
      has_image: true,
    });

    expect(organization).toMatchObject({
      id: 'test_id',
      name: 'test_name',
      slug: 'test_slug',
      hasImage: true,
      imageUrl:
        'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJ1c2VyXzJKbElJQTN2VXNjWXh1N2VUMnhINmFrTGgxOCIsImluaXRpYWxzIjoiREsifQ?width=160',
      membersCount: 1,
      pendingInvitationsCount: 10,
      maxAllowedMemberships: 3,
      adminDeleteEnabled: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      publicMetadata: {
        public: 'metadata',
      },
    });
  });
});

describe('Organization Snapshots', () => {
  it('should match snapshot for organization structure', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'org_123',
      name: 'Test Organization',
      public_metadata: {
        public: 'metadata',
        department: 'engineering',
        location: 'San Francisco',
      },

      slug: 'test-org',
      image_url: 'https://example.com/org-image.jpg',
      created_at: 1735689600000,
      updated_at: 1735689700000,
      members_count: 25,
      pending_invitations_count: 5,
      admin_delete_enabled: true,
      max_allowed_memberships: 100,
      has_image: true,
    });

    const orgSnapshot = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      hasImage: organization.hasImage,
      imageUrl: organization.imageUrl,
      membersCount: organization.membersCount,
      pendingInvitationsCount: organization.pendingInvitationsCount,
      maxAllowedMemberships: organization.maxAllowedMemberships,
      adminDeleteEnabled: organization.adminDeleteEnabled,
      createdAt: organization.createdAt?.getTime(),
      updatedAt: organization.updatedAt?.getTime(),
      publicMetadata: organization.publicMetadata,
    };

    expect(orgSnapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal organization', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'org_minimal',
      name: 'Minimal Org',
      public_metadata: {},

      slug: '',
      image_url: '',
      created_at: 1735689600000,
      updated_at: 1735689600000,
      members_count: 1,
      pending_invitations_count: 0,
      admin_delete_enabled: false,
      max_allowed_memberships: 1,
      has_image: false,
    });

    const orgSnapshot = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      hasImage: organization.hasImage,
      imageUrl: organization.imageUrl,
      membersCount: organization.membersCount,
      pendingInvitationsCount: organization.pendingInvitationsCount,
      maxAllowedMemberships: organization.maxAllowedMemberships,
      adminDeleteEnabled: organization.adminDeleteEnabled,
      createdAt: organization.createdAt?.getTime(),
      updatedAt: organization.updatedAt?.getTime(),
      publicMetadata: organization.publicMetadata,
    };

    expect(orgSnapshot).toMatchSnapshot();
  });
});
