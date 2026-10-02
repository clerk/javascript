import { useOrganization } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import { APIKeysTable } from '../api-keys/api-keys-table';

export interface OrganizationProfileApiKeysPanelProps {
  fallback?: ReactNode;
}

export function OrganizationProfileApiKeysPanel({ fallback }: OrganizationProfileApiKeysPanelProps) {
  const { organization } = useOrganization();
  const m = useMessages('organizationProfile');

  if (!organization) {
    return fallback ?? null;
  }

  return (
    <Panel.Root render={<div {...themeProps('organization-profile-api-keys-panel')} />}>
      <Panel.Title>{m.pages.apiKeys}</Panel.Title>
      <APIKeysTable
        subject={organization.id}
        fallback={fallback}
      />
    </Panel.Root>
  );
}
