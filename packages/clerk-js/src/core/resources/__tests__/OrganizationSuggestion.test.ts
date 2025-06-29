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

    expect(organizationSuggestion).toMatchObject({
      id: 'test_id',
      status: 'pending',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      publicOrganizationData: {
        hasImage: true,
        id: 'test_org_id',
        imageUrl: 'test_image_url',
        name: 'Test org',
        slug: 'test-org',
      },
    });
  });
});

describe('OrganizationSuggestion Snapshots', () => {
  it('should match snapshot for organization suggestion structure', () => {
    const organizationSuggestion = new OrganizationSuggestion({
      object: 'organization_suggestion',
      id: 'suggestion_123',
      public_organization_data: {
        id: 'org_123',
        name: 'Tech Innovators Inc',
        slug: 'tech-innovators',
        image_url: 'https://example.com/tech-logo.png',
        has_image: true,
      },
      status: 'pending',
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    expect(organizationSuggestion).toMatchSnapshot();
  });

  it('should match snapshot for organization suggestion with accepted status', () => {
    const organizationSuggestion = new OrganizationSuggestion({
      object: 'organization_suggestion',
      id: 'suggestion_accepted',
      public_organization_data: {
        id: 'org_456',
        name: 'Design Studio',
        slug: 'design-studio',
        image_url: null,
        has_image: false,
      },
      status: 'accepted',
      created_at: 1735689600000,
      updated_at: 1735689700000,
    });

    expect(organizationSuggestion).toMatchSnapshot();
  });
});
