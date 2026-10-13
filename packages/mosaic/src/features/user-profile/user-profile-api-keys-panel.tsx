import { useUser } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import { APIKeysTable } from '../api-keys/api-keys-table';
import { useAPIKeysAccess } from '../api-keys/api-keys-table.model';

export interface UserProfileApiKeysPanelProps {
  fallback?: ReactNode;
}

export function UserProfileApiKeysPanel({ fallback }: UserProfileApiKeysPanelProps) {
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
        fallback={fallback}
      />
    </Panel.Root>
  );
}
