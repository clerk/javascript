import { OrganizationMembership } from '../internal';

describe('OrganizationMembership', () => {
  it('has the same initial properties', () => {
    const organizationMemberShip = new OrganizationMembership({
      object: 'organization_membership',
      id: 'test_id',
      created_at: 12345,
      updated_at: 5678,
      role: 'admin',
      permissions: [],
      organization: {
        id: 'test_org_id',
        image_url:
          'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJ1c2VyXzJKbElJQTN2VXNjWXh1N2VUMnhINmFrTGgxOCIsImluaXRpYWxzIjoiREsifQ?width=160',
        name: 'test_name',
        slug: 'test_slug',
        public_metadata: { public: 'metadata' },
        object: 'organization',
        created_at: 12345,
        updated_at: 67890,
        members_count: 1,
        pending_invitations_count: 10,
        admin_delete_enabled: true,
        max_allowed_memberships: 3,
        has_image: true,
      },
      public_metadata: {
        foo: 'bar',
      },
      public_user_data: {
        object: 'public_user_data',
        first_name: 'test_first_name',
        last_name: 'test_last_name',
        image_url:
          ' https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLTmR2TUtFQzN5cUVpMVFjV0UzQjExbF9WUEVOWW5manlLMlVQd0tCSWw9czEwMDAtYyIsInMiOiJkRkowS3dTSkRINndiODE5cXJTUUxxaWF1ZS9QcHdndC84L0lUUlpYNHpnIn0?width=160',
        identifier: 'test@identifier.gr',
        id: 'test_user_id',
        has_image: true,
      },
    });

    expect(organizationMemberShip).toMatchSnapshot();
  });
});
