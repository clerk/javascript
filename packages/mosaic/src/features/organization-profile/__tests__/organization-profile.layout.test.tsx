import { describe, expect, it } from 'vitest';

import { getAvailableOrganizationProfilePages, resolveOrganizationProfilePages } from '../organization-profile.layout';
import type { CustomOrganizationProfilePage, OrganizationProfilePages } from '../organization-profile.types';

const general: OrganizationProfilePages['general'] = <p>General</p>;

describe('resolveOrganizationProfilePages', () => {
  it('keeps the first custom page for a repeated path', () => {
    const audit: CustomOrganizationProfilePage = { label: 'Audit', path: 'audit', content: null };
    const otherAudit: CustomOrganizationProfilePage = { label: 'Other audit', path: 'audit', content: null };

    expect(resolveOrganizationProfilePages(['general'], [audit, otherAudit])).toEqual([
      { id: 'general' },
      { id: 'audit', custom: audit },
    ]);
  });
});

describe('getAvailableOrganizationProfilePages', () => {
  it('lists api keys given content', () => {
    expect(getAvailableOrganizationProfilePages({ general, apiKeys: <p>API keys</p> })).toEqual(['general', 'apiKeys']);
  });

  it.each([null, false])('drops api keys given %s content', apiKeys => {
    expect(getAvailableOrganizationProfilePages({ general, apiKeys })).toEqual(['general']);
  });
});
