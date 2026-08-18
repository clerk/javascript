import type { UserProfileAPIKey } from '@clerk/ui/mosaic/user-profile/user-profile-api-keys-panel.view';
import { UserProfileApiKeysPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-api-keys-panel.view';
import { useMemo, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-api-keys-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileApiKeysPanel',
  label: 'API keys panel',
  navigation: { family: 'User profile', category: 'Compositions', order: 40 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-api-keys-panel.view.tsx',
};

const initialAPIKeys: UserProfileAPIKey[] = [
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
  const [apiKeys, setAPIKeys] = useState(initialAPIKeys);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleAPIKeys = useMemo(
    () => apiKeys.filter(apiKey => apiKey.name.toLowerCase().includes(searchValue.toLowerCase())),
    [apiKeys, searchValue],
  );

  return (
    <UserProfileApiKeysPanelView
      apiKeys={visibleAPIKeys}
      pagination={{ page: 1, pageCount: 1, pageSize }}
      searchValue={searchValue}
      selectedIds={selectedIds}
      onCreate={() =>
        setAPIKeys(current => [
          ...current,
          {
            id: `key-${Date.now()}`,
            name: `API Key ${current.length + 1}`,
            expirationLabel: 'Expires Never',
            createdAtLabel: 'Just now',
            lastUsedAtLabel: 'Never',
          },
        ])
      }
      onPageSizeChange={setPageSize}
      onRevoke={id => {
        setAPIKeys(current => current.filter(apiKey => apiKey.id !== id));
        setSelectedIds(current => current.filter(selectedId => selectedId !== id));
      }}
      onSearchChange={setSearchValue}
      onSelectionChange={setSelectedIds}
    />
  );
}

export function Empty() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <UserProfileApiKeysPanelView
      apiKeys={[]}
      searchValue={searchValue}
      selectedIds={[]}
      onCreate={() => {}}
      onSearchChange={setSearchValue}
      onSelectionChange={() => {}}
    />
  );
}
