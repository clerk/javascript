import { OrganizationProfileApiKeysSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-api-keys-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-api-keys-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileApiKeysSection',
  label: 'API keys',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-api-keys-section.view.tsx',
};

export const apiKeys = [
  {
    id: 'primary',
    name: 'Primary API Key',
    expirationLabel: 'Expires Dec 31, 2027',
    createdAtLabel: 'Jan 05, 2026',
    lastUsedAtLabel: 'Dec 31, 2026',
  },
  {
    id: 'backup',
    name: 'Backup API Key',
    expirationLabel: 'Expires Never',
    createdAtLabel: 'Mar 22, 2022',
    lastUsedAtLabel: 'Mar 22, 2022',
  },
  {
    id: 'analytics',
    name: 'Analytics Key',
    expirationLabel: 'Expires Never',
    createdAtLabel: 'Feb 10, 2021',
    lastUsedAtLabel: 'Feb 10, 2021',
  },
  {
    id: 'integration',
    name: 'Integration Key',
    expirationLabel: 'Expires Nov 5, 2026',
    createdAtLabel: 'Nov 5, 2025',
    lastUsedAtLabel: 'Nov 5, 2026',
    isExpired: true,
  },
  {
    id: 'legacy',
    name: 'Legacy API Key',
    expirationLabel: 'Expired Jul 1, 2025',
    createdAtLabel: 'Jul 1, 2024',
    lastUsedAtLabel: 'Jul 1, 2025',
    isExpired: true,
  },
  {
    id: 'development',
    name: 'Dev Environment Key',
    expirationLabel: 'Expired Sep 30, 2024',
    createdAtLabel: 'Sep 30, 2022',
    lastUsedAtLabel: 'Sep 30, 2024',
    isExpired: true,
  },
];

export function Default() {
  return (
    <OrganizationProfileApiKeysSectionView
      apiKeys={apiKeys}
      pagination={{ page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      selectedIds={[]}
      onManage={() => undefined}
      onPageChange={() => undefined}
      onPageSizeChange={() => undefined}
      onSelectionChange={() => undefined}
    />
  );
}

export function Empty() {
  return (
    <OrganizationProfileApiKeysSectionView
      apiKeys={[]}
      selectedIds={[]}
      onSelectionChange={() => undefined}
    />
  );
}
