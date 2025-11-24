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
