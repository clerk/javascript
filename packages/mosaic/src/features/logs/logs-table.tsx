import type { ReactNode } from 'react';

import { useMessages } from '../../localization';
import { useLogsTableController } from './logs-table.controller';
import { PAGE_SIZE } from './logs-table.model';
import { LogsTableRestrictedView, LogsTableView } from './logs-table.view';

export interface LogsTableProps {
  perPage?: number;
  fallback?: ReactNode;
}

export function LogsTable({ perPage, fallback }: LogsTableProps) {
  const messages = useMessages('logsTable');
  const pageSize = perPage !== undefined && Number.isInteger(perPage) && perPage > 0 ? perPage : PAGE_SIZE;
  const { isLoaded, isAvailable, canRead, isLoading, ...controller } = useLogsTableController({
    pageSize,
    messages,
  });

  if (!isLoaded || !isAvailable || isLoading) {
    return fallback ?? null;
  }
  if (!canRead) {
    return <LogsTableRestrictedView messages={messages} />;
  }

  return (
    <LogsTableView
      messages={messages}
      pageSize={pageSize}
      {...controller}
    />
  );
}
