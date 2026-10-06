import { describe, expect, it } from 'vitest';

import { getAvailableOrganizationProfilePages } from '../organization-profile.layout';
import type { OrganizationProfilePages } from '../organization-profile.types';

const general: OrganizationProfilePages['general'] = { name: 'Acme', slug: 'acme', memberCount: 1 };

describe('getAvailableOrganizationProfilePages', () => {
  it('lists api keys given content', () => {
    expect(getAvailableOrganizationProfilePages({ general, apiKeys: <p>API keys</p> })).toEqual(['general', 'apiKeys']);
  });

  it.each([null, false])('drops api keys given %s content', apiKeys => {
    expect(getAvailableOrganizationProfilePages({ general, apiKeys })).toEqual(['general']);
  });
});
