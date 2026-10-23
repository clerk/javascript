import { useOrganization } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import { APIKeysTable } from '../api-keys/api-keys-table';
import { useAPIKeysAccess } from '../api-keys/api-keys-table.model';

export interface OrganizationProfileApiKeysPanelProps extends Omit<APIKeysPageProps, 'hide'> {
  fallback?: ReactNode;
}

export function OrganizationProfileApiKeysPanel({
  perPage,
  showDescription,
  fallback,
}: OrganizationProfileApiKeysPanelProps) {
  const { organization } = useOrganization();
  const { isAvailable } = useAPIKeysAccess(organization?.id);
  const m = useMessages('organizationProfile');

  if (!organization || !isAvailable) {
    return fallback ?? null;
  }

  return (
    <Panel.Root render={<div {...themeProps('organization-profile-api-keys-panel')} />}>
      <Panel.Title>{m.pages.apiKeys}</Panel.Title>
      <APIKeysTable
        subject={organization.id}
        perPage={perPage}
        showDescription={showDescription}
        fallback={fallback}
      />
    </Panel.Root>
  );
}
