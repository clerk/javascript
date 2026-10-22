import { LogsTableRestrictedView, LogsTableView } from '@clerk/mosaic/features/logs/logs-table.view';
import { useMessages } from '@clerk/mosaic/localization';

import type { StoryMeta } from '@/lib/types';

import { useLogsTableFixture } from './fixtures/logs-table';

export { default as __source } from './logs-table.stories?raw';

export const meta: StoryMeta = {
  group: 'Logs',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'LogsTable',
  label: 'Logs table',
  layout: 'wide',
  source: 'packages/mosaic/src/features/logs/logs-table.view.tsx',
};

export function Default() {
  const props = useLogsTableFixture();
  return <LogsTableView {...props} />;
}

export function Empty() {
  const props = useLogsTableFixture({ initialLogs: [] });
  return <LogsTableView {...props} />;
}

export function NoPermission() {
  return <LogsTableRestrictedView messages={useMessages('logsTable')} />;
}
