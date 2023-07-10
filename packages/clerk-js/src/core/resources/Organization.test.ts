import { Organization } from './internal';

describe('Organization', () => {
  it('has the same initial properties', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'test_id',
      name: 'test_name',
      public_metadata: { public: 'metadata' },
      slug: 'test_slug',
      logo_url: 'https://url-for-logo.png',
      image_url: 'https://clerk.com',
      created_at: 12345,
      updated_at: 5678,
      members_count: 1,
      pending_invitations_count: 10,
      admin_delete_enabled: true,
      max_allowed_memberships: 3,
    });

    expect(organization).toMatchSnapshot();
  });
});
