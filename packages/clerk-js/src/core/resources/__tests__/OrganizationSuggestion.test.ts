import { OrganizationSuggestion } from '../internal';

describe('OrganizationSuggestion', () => {
  it('has the same initial properties', () => {
    const organizationSuggestion = new OrganizationSuggestion({
      object: 'organization_suggestion',
      id: 'test_id',
      public_organization_data: {
        id: 'test_org_id',
        name: 'Test org',
        slug: 'test-org',
        image_url: 'test_image_url',
        has_image: true,
      },
      status: 'pending',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(organizationSuggestion).toMatchSnapshot();
  });
});
