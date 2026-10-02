import { useUser } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import { APIKeysTable } from '../api-keys/api-keys-table';

export interface UserProfileApiKeysPanelProps {
  fallback?: ReactNode;
}

export function UserProfileApiKeysPanel({ fallback }: UserProfileApiKeysPanelProps) {
  const { user } = useUser();
  const enabled = useMosaicEnvironment()?.apiKeysSettings.user_api_keys_enabled;
  const m = useMessages('userProfile');

  if (!user || !enabled) {
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
