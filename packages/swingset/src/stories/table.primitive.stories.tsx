'use client';

import { Table, type TableSort } from '@clerk/mosaic/primitives/table';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'wip',
  title: 'Table',
  source: 'packages/mosaic/src/primitives/table/index.ts',
};

interface Log {
  id: string;
  message: string;
  status: string;
  duration: string;
  children?: Log[];
}

const LOGS: Log[] = [
  {
    id: 'req-1',
    message: 'POST /v1/client/sign_ins',
    status: '200',
    duration: '182 ms',
    children: [
      { id: 'req-1-db', message: 'SELECT users', status: 'ok', duration: '12 ms' },
      {
        id: 'req-1-hook',
        message: 'webhook user.signed_in',
        status: 'ok',
        duration: '96 ms',
        children: [{ id: 'req-1-hook-retry', message: 'retry 1', status: 'ok', duration: '41 ms' }],
      },
    ],
  },
  { id: 'req-2', message: 'GET /v1/me', status: '200', duration: '24 ms' },
  {
    id: 'req-3',
    message: 'POST /v1/client/sign_ups',
    status: '422',
    duration: '58 ms',
    children: [{ id: 'req-3-validate', message: 'validate email_address', status: 'error', duration: '3 ms' }],
  },
  { id: 'req-4', message: 'DELETE /v1/sessions', status: '403', duration: '9 ms' },
];

const CELL =
  'border-b px-3 py-2 text-start font-normal focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';

export function Default() {
  const [opened, setOpened] = useState<string | null>(null);
  const [sort, setSort] = useState<TableSort | null>(null);
  const logs = sort ? sortLogs(LOGS, sort) : LOGS;

  return (
    <div className='not-prose w-full'>
      <Table.Root
        aria-label='Request logs'
        selectionMode='multiple'
        defaultExpanded={['req-1']}
        sort={sort}
        onSortChange={setSort}
        className='w-full border-collapse text-sm'
      >
        <Table.Header className='text-muted-foreground'>
          <Table.Column className={`${CELL} w-10 font-medium`}>
            <Table.SelectionCheckbox />
          </Table.Column>
          <Table.Column
            value='message'
            sortable
            rowHeader
            className={`${CELL} hover:text-foreground cursor-pointer font-medium after:ms-1 data-[sort-direction=ascending]:after:content-['↑'] data-[sort-direction=descending]:after:content-['↓']`}
          >
            Message
          </Table.Column>
          <Table.Column className={`${CELL} font-medium`}>Status</Table.Column>
          <Table.Column className={`${CELL} font-medium`}>Duration</Table.Column>
        </Table.Header>
        <Table.Body
          items={logs}
          itemToStringValue={log => log.id}
          itemToChildren={log => log.children}
        >
          {log => (
            <Table.Row
              disabled={log.id === 'req-4'}
              onClick={() => setOpened(log.message)}
              className='hover:bg-muted data-selected:bg-accent focus-visible:outline-ring data-actionable:cursor-pointer data-disabled:cursor-default data-disabled:opacity-50 focus-visible:outline-2 focus-visible:-outline-offset-2'
            >
              <Table.Cell className={CELL}>
                <Table.SelectionCheckbox />
              </Table.Cell>
              <Table.Cell className={`${CELL} ps-[calc(2.25rem+var(--table-row-depth)*1.25rem)]`}>
                <Table.ExpandButton className='hover:bg-muted-foreground/15 data-expanded:rotate-90 rtl:data-collapsed:-scale-x-100 -ms-6 me-1 size-5 cursor-pointer rounded'>
                  ›
                </Table.ExpandButton>
                {log.message}
              </Table.Cell>
              <Table.Cell className={`${CELL} tabular-nums`}>{log.status}</Table.Cell>
              <Table.Cell className={`${CELL} text-muted-foreground tabular-nums`}>{log.duration}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      <p
        aria-live='polite'
        className='text-muted-foreground mt-3 text-sm'
      >
        {opened ? `Opened ${opened}` : 'Click a row or press Enter to open it.'}
      </p>
    </div>
  );
}

function sortLogs(logs: Log[], sort: TableSort): Log[] {
  const sign = sort.direction === 'ascending' ? 1 : -1;
  return [...logs]
    .sort((a, b) => sign * a.message.localeCompare(b.message))
    .map(log => (log.children ? { ...log, children: sortLogs(log.children, sort) } : log));
}
