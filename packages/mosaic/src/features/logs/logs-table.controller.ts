import { useState } from 'react';

import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import { useLocale } from '../../localization';
import { formatFullTimestamp, formatTimestamp } from './logs-table.format';
import { useLogsTableModel } from './logs-table.model';
import type { LogEntry, LogRecord, LogsTableMessages } from './logs-table.types';

const SEARCH_DEBOUNCE_MS = 500;

export interface LogsTableControllerOptions {
  pageSize: number;
  messages: LogsTableMessages;
}

export function useLogsTableController({ pageSize, messages }: LogsTableControllerOptions) {
  const [searchValue, setSearchValue] = useState('');
  const debounced = useDebouncedAsync(searchValue, value => Promise.resolve(value.trim()), {
    delayMs: SEARCH_DEBOUNCE_MS,
  });
  const query = searchValue.trim() === '' ? '' : (debounced.data ?? '');
  const [paging, setPaging] = useState({ query, page: 1 });
  const page = paging.query === query ? paging.page : 1;
  const model = useLogsTableModel({ page, pageSize, query });
  const locale = useLocale();

  return {
    isLoaded: model.isLoaded,
    isAvailable: model.isAvailable,
    canRead: model.canRead,
    isLoading: model.isLoading,
    logs: model.data.map(log => toLogEntry(log, messages, locale)),
    totalCount: model.count,
    page,
    searchValue,
    isFetching: model.isFetching,
    isError: model.isError,
    onRetry: () => void model.revalidate(),
    onPageChange: (next: number) => setPaging({ query, page: next }),
    onSearchChange: setSearchValue,
  };
}

function toLogEntry(log: LogRecord, messages: LogsTableMessages, locale: string): LogEntry {
  return {
    id: log.id,
    code: log.code,
    eventLabel: messages.events[log.type],
    actor: log.actor,
    target: log.target,
    ipAddress: log.ipAddress,
    location: log.location,
    device: log.device,
    timestampLabel: formatTimestamp(log.occurredAt, locale),
    fullTimestampLabel: formatFullTimestamp(log.occurredAt, locale),
  };
}
