/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import type { ApiKeyRow } from '@clerk/ui/mosaic/organization/organization-profile-api-keys-panel.view';
import { OrganizationProfileApiKeysPanelView } from '@clerk/ui/mosaic/organization/organization-profile-api-keys-panel.view';
import { organizationProfileApiKeysPanelCreateMachine } from '@clerk/ui/mosaic/organization/organization-profile-api-keys-panel-create.machine';
import { organizationProfileApiKeysPanelRevokeMachine } from '@clerk/ui/mosaic/organization/organization-profile-api-keys-panel-revoke.machine';
import { useMemo, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileApiKeysPanel',
  source: 'packages/ui/src/mosaic/organization/organization-profile-api-keys-panel.tsx',
};

const SHOW_DESCRIPTION = false;

// Fixed dates (not `Date.now()`) so the demo renders deterministically across reloads.
const DEMO_ROWS: ApiKeyRow[] = [
  {
    id: 'key_prod',
    name: 'Production',
    createdAt: new Date('2026-01-12'),
    expiration: null,
    lastUsedAt: new Date('2026-06-28'),
  },
  {
    id: 'key_ci',
    name: 'CI pipeline',
    createdAt: new Date('2026-03-04'),
    expiration: new Date('2026-09-04'),
    lastUsedAt: null,
  },
  {
    id: 'key_staging',
    name: 'Staging',
    createdAt: new Date('2026-05-20'),
    expiration: null,
    lastUsedAt: new Date('2026-07-01'),
  },
];

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function Default() {
  const [searchValue, setSearchValue] = useState('');

  const rows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return query ? DEMO_ROWS.filter(row => row.name.toLowerCase().includes(query)) : DEMO_ROWS;
  }, [searchValue]);

  const [createSnapshot, sendCreate, createActor] = useMachine(organizationProfileApiKeysPanelCreateMachine, {
    context: {
      showDescription: SHOW_DESCRIPTION,
      createAPIKey: async params => {
        await delay(600);
        return { name: params.name, secret: `sk_test_${params.name.replace(/\s+/g, '_').toLowerCase()}` };
      },
    },
  });

  const [revokeSnapshot, sendRevoke, revokeActor] = useMachine(organizationProfileApiKeysPanelRevokeMachine, {
    context: {
      confirmationText: 'Revoke',
      revokeAPIKey: () => delay(600),
    },
  });

  return (
    <OrganizationProfileApiKeysPanelView
      list={{
        rows,
        isLoading: false,
        page: 1,
        pageCount: 1,
        itemCount: rows.length,
        onPageChange: () => undefined,
        searchValue,
        onSearchChange: setSearchValue,
      }}
      canManage
      create={{
        snapshot: createSnapshot,
        send: sendCreate,
        canSubmit: createActor.can({ type: 'SUBMIT' }),
        showDescription: SHOW_DESCRIPTION,
      }}
      revoke={{
        snapshot: revokeSnapshot,
        send: sendRevoke,
        canConfirm: revokeActor.can({ type: 'CONFIRM' }),
      }}
    />
  );
}
