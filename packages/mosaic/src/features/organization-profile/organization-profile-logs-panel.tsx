import type { ReactNode } from 'react';

import { Panel } from '../../components/panel';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import { LogsTable } from '../logs/logs-table';
import { useLogsAccess } from '../logs/logs-table.model';

export interface OrganizationProfileLogsPanelProps {
  perPage?: number;
  fallback?: ReactNode;
}

export function OrganizationProfileLogsPanel({ perPage, fallback }: OrganizationProfileLogsPanelProps) {
  const { isAvailable } = useLogsAccess();
  const m = useMessages('organizationProfile');

  if (!isAvailable) {
    return fallback ?? null;
  }

  return (
    <Panel.Root render={<div {...themeProps('organization-profile-logs-panel')} />}>
      <Panel.Title>{m.pages.logs}</Panel.Title>
      <LogsTable
        perPage={perPage}
        fallback={fallback}
      />
    </Panel.Root>
  );
}
