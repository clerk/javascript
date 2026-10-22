import { Panel } from '@clerk/mosaic/components/panel';
import { formatFullTimestamp, formatTimestamp } from '@clerk/mosaic/features/logs/logs-table.format';
import { SAMPLE_LOGS } from '@clerk/mosaic/features/logs/logs-table.sample';
import type { LogRecord, LogsTableViewProps } from '@clerk/mosaic/features/logs/logs-table.types';
import { LogsTableView } from '@clerk/mosaic/features/logs/logs-table.view';
import { useLocale, useMessages } from '@clerk/mosaic/localization';
import { useEffect, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosName, chaosRows, chaosText } from '@/lib/chaos';

export function useLogsTableFixture({
  initialLogs = SAMPLE_LOGS,
}: { initialLogs?: LogRecord[] } = {}): LogsTableViewProps {
  const locale = useLocale();
  const messages = useMessages('logsTable');
  const logs = useChaosFixture(initialLogs, items =>
    chaosRows(items).map((log, index) => ({
      ...log,
      actor: { ...log.actor, name: chaosName(index), email: chaosEmail(index) },
      target: chaosText(log.target ?? undefined) ?? null,
    })),
  );
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const next = searchValue.trim().toLowerCase();
    if (next === query) {
      return;
    }
    const timer = setTimeout(() => {
      setQuery(next);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, query]);

  const filtered = logs.filter(log =>
    [log.code, log.actor.name, log.actor.email, log.ipAddress, log.target ?? ''].some(value =>
      value.toLowerCase().includes(query),
    ),
  );

  return {
    messages,
    logs: filtered.slice((page - 1) * pageSize, page * pageSize).map(log => ({
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
    })),
    totalCount: filtered.length,
    page,
    pageSize,
    searchValue,
    onSearchChange: setSearchValue,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  };
}

export function LogsPanelExample(props: LogsTableViewProps) {
  const m = useMessages('organizationProfile');
  return (
    <Panel.Root>
      <Panel.Title>{m.pages.logs}</Panel.Title>
      <LogsTableView {...props} />
    </Panel.Root>
  );
}
