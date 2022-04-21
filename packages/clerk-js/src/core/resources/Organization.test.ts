import { Organization } from 'core/resources/internal';

describe('Organization', () => {
  it('has the same initial properties', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'test_id',
      name: 'test_name',
      public_metadata: { public: 'metadata' },
      slug: 'test_slug',
      logo_url: 'https://url-for-logo.png',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(organization).toMatchSnapshot();
  });
});
