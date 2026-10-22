import { useOrganization, useSession } from '@clerk/shared/react';

import { SAMPLE_LOGS } from './logs-table.sample';
import type { LogRecord } from './logs-table.types';

export const PAGE_SIZE = 10;
const READ_PERMISSION = 'org:sys_logs:read';

export function useLogsAccess() {
  const { isLoaded: isOrganizationLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const isAvailable = Boolean(organization && session?.lastActiveOrganizationId === organization.id);
  const canRead = isAvailable && (session?.checkAuthorization({ permission: READ_PERMISSION }) ?? false);

  return { isLoaded: isOrganizationLoaded && isSessionLoaded, isAvailable, canRead };
}

export function useLogsTableModel({ page, pageSize, query }: { page: number; pageSize: number; query: string }) {
  const { isLoaded, isAvailable, canRead } = useLogsAccess();
  const matches = canRead ? SAMPLE_LOGS.filter(log => matchesQuery(log, query)) : [];

  return {
    isLoaded,
    isAvailable,
    canRead,
    data: matches.slice((page - 1) * pageSize, page * pageSize),
    count: matches.length,
    isLoading: false,
    isFetching: false,
    isError: false,
    revalidate: () => Promise.resolve(),
  };
}

function matchesQuery(log: LogRecord, query: string) {
  const needle = query.toLowerCase();
  return [log.code, log.actor.name, log.actor.email, log.ipAddress, log.target ?? ''].some(value =>
    value.toLowerCase().includes(needle),
  );
}

export type LogsTableModel = ReturnType<typeof useLogsTableModel>;
