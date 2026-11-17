import { useUser } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import { APIKeysTable } from '../api-keys/api-keys-table';
import { useAPIKeysAccess } from '../api-keys/api-keys-table.model';

export interface UserProfileApiKeysPanelProps extends Omit<APIKeysPageProps, 'hide'> {
  fallback?: ReactNode;
}

export function UserProfileApiKeysPanel({ perPage, showDescription, fallback }: UserProfileApiKeysPanelProps) {
  const { user } = useUser();
  const { isAvailable } = useAPIKeysAccess(user?.id);
  const m = useMessages('userProfile');

  if (!user || !isAvailable) {
    return fallback ?? null;
  }

  return (
    <Panel.Root render={<div {...themeProps('user-profile-api-keys-panel')} />}>
      <Panel.Title>{m.pages.apiKeys}</Panel.Title>
      <APIKeysTable
        subject={user.id}
        perPage={perPage}
        showDescription={showDescription}
        fallback={fallback}
      />
    </Panel.Root>
  );
}
