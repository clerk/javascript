import * as stylex from '@stylexjs/stylex';
import { Fragment, useMemo } from 'react';

import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import type { DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { EmptyState } from '../../components/empty-state';
import { Entity } from '../../components/entity';
import { Pagination } from '../../components/pagination';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { Document } from '../../icons/glyphs/document';
import { ExclamationCircle } from '../../icons/glyphs/exclamation-circle';
import { Lock } from '../../icons/glyphs/lock';
import { fill } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { truncationStyles } from '../../styles/typography.styles';
import { LogDetailsDialog } from './log-details.dialog';
import { styles } from './logs-table.styles';
import type { LogEntry, LogsTableMessages, LogsTableViewProps } from './logs-table.types';

const getRowId = (row: LogEntry) => row.id;

export function LogsTableView({
  messages: m,
  logs,
  totalCount,
  page,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  isFetching = false,
  isError = false,
  onRetry,
}: LogsTableViewProps) {
  const details = useMemo(() => Dialog.createHandle<LogEntry>(), []);
  const showPagination = Math.ceil(totalCount / pageSize) > 1 || (totalCount > 0 && Boolean(onPageSizeChange));
  const query = searchValue.trim();
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noLogs, description: m.noLogsDescription };

  return (
    <>
      <div {...mergeStyleProps(themeProps('logs-table'), stylex.props(styles.root))}>
        <VisuallyHidden role='status'>{isError ? m.loadError : m.loaded}</VisuallyHidden>
        <Table.Toolbar>
          <Table.Search
            label={m.search}
            clearLabel={m.clearSearch}
            value={searchValue}
            onValueChange={onSearchChange}
          />
        </Table.Toolbar>
        <Table.Root
          aria-label={m.title}
          aria-busy={isFetching}
          layout='fixed'
          minWidth='44rem'
        >
          <Table.Header>
            <Table.Column>{m.event}</Table.Column>
            <Table.Column>{m.member}</Table.Column>
            <Table.Column width='11rem'>{m.ipAddress}</Table.Column>
            <Table.Column width='11rem'>{m.timestamp}</Table.Column>
          </Table.Header>
          <Table.Body
            items={isError ? [] : logs}
            itemToStringValue={getRowId}
            renderEmptyState={() =>
              isError ? (
                <EmptyState.Root>
                  <EmptyState.Icon glyph={ExclamationCircle} />
                  <EmptyState.Label>{m.loadError}</EmptyState.Label>
                  <EmptyState.Description>{m.loadErrorDescription}</EmptyState.Description>
                  {onRetry ? (
                    <EmptyState.Actions>
                      <Button
                        variant='outline'
                        color='neutral'
                        onClick={onRetry}
                      >
                        {m.retry}
                      </Button>
                    </EmptyState.Actions>
                  ) : null}
                </EmptyState.Root>
              ) : (
                <EmptyState.Root>
                  <EmptyState.Icon glyph={Document} />
                  <EmptyState.Label>{emptyState.label}</EmptyState.Label>
                  <EmptyState.Description>{emptyState.description}</EmptyState.Description>
                </EmptyState.Root>
              )
            }
          >
            {log => (
              <LogRow
                log={log}
                details={details}
                messages={m}
              />
            )}
          </Table.Body>
        </Table.Root>
        {showPagination ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalCount}
            disabled={isFetching}
            onChange={onPageChange}
            onPageSizeChange={
              onPageSizeChange
                ? next => {
                    onPageSizeChange(next);
                    onPageChange(1);
                  }
                : undefined
            }
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
          />
        ) : null}
      </div>
      <LogDetailsDialog
        handle={details}
        messages={m}
      />
    </>
  );
}

function LogRow({
  log,
  details,
  messages: m,
}: {
  log: LogEntry;
  details: DialogHandle<LogEntry>;
  messages: LogsTableMessages;
}) {
  return (
    <Table.Row>
      <Table.Cell>
        <div {...stylex.props(styles.event)}>
          <Dialog.Trigger
            handle={details}
            payload={log}
            aria-label={fill(m.viewDetails, { event: log.eventLabel })}
            render={<Button variant='link' />}
          >
            {log.eventLabel}
          </Dialog.Trigger>
          <Text
            size='xs'
            color='foreground-secondary'
          >
            <EventCode code={log.code} />
          </Text>
        </div>
      </Table.Cell>
      <Table.Cell>
        <Entity.Root>
          <Entity.Media>
            <Avatar.Root
              size='fit'
              aria-hidden
            >
              {log.actor.imageUrl ? (
                <Avatar.Image
                  src={log.actor.imageUrl}
                  alt=''
                />
              ) : null}
              <Avatar.Fallback />
            </Avatar.Root>
          </Entity.Media>
          <Entity.Content>
            <Entity.Label>{log.actor.name}</Entity.Label>
            <Entity.Description>{log.actor.email}</Entity.Description>
          </Entity.Content>
        </Entity.Root>
      </Table.Cell>
      <Table.Cell>
        <Text
          title={log.ipAddress}
          xstyle={truncationStyles.singleLine}
        >
          {log.ipAddress}
        </Text>
      </Table.Cell>
      <Table.Cell noWrap>{log.timestampLabel}</Table.Cell>
    </Table.Row>
  );
}

function EventCode({ code }: { code: string }) {
  let start = 0;
  return (code.match(/[^._]*[._]|[^._]+/g) ?? ['']).map(part => {
    const offset = start;
    start += part.length;
    return (
      <Fragment key={offset}>
        {offset > 0 ? <wbr /> : null}
        {part}
      </Fragment>
    );
  });
}

export function LogsTableRestrictedView({ messages: m }: { messages: LogsTableMessages }) {
  return (
    <div {...mergeStyleProps(themeProps('logs-table', { restricted: true }), stylex.props(styles.root))}>
      <EmptyState.Root role='status'>
        <EmptyState.Icon glyph={Lock} />
        <EmptyState.Label>{m.noAccess}</EmptyState.Label>
        <EmptyState.Description>{m.noAccessDescription}</EmptyState.Description>
      </EmptyState.Root>
    </div>
  );
}
