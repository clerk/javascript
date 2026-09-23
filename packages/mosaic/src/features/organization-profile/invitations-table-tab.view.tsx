import * as stylex from '@stylexjs/stylex';
import { useRef } from 'react';

import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { panelStyles } from '../../components/profile';
import { Spinner } from '../../components/spinner';
import { Table, type TableHeaderCellProps } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { fill, useMessages } from '../../localization';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './invitations-table-tab.styles';
import type {
  InvitationsTableSort,
  InvitationsTableTabViewProps,
  OrganizationProfileInvitation,
} from './invitations-table-tab.types';

const getRowId = (invitation: OrganizationProfileInvitation) => invitation.id;

export function InvitationsTableTabView({
  invitations,
  onInvite,
  onRevoke,
  totalCount,
  page,
  pageSize = 10,
  searchValue,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onBulkAction,
  sort,
  onSortChange,
  isLoading,
  isFetching = false,
}: InvitationsTableTabViewProps) {
  const m = useMessages('invitationsTableTab');
  const columnCount = 3 + Number(Boolean(onRevoke)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const searchInput = useRef<HTMLInputElement>(null);
  const table = useDataTable({ data: invitations, getRowId, totalCount });
  const sortHeader = (column: InvitationsTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => ({
    sort: sort?.column === column ? sort.direction : 'none',
    onSort: onSortChange
      ? () => {
          table.setRowSelection({});
          onSortChange(
            sort?.column !== column
              ? { column, direction: 'ascending' }
              : sort.direction === 'ascending'
                ? { column, direction: 'descending' }
                : null,
          );
        }
      : undefined,
  });
  return (
    <div {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(panelStyles.root))}>
      <div {...stylex.props(styles.toolbar)}>
        <InputGroup.Root
          size='md'
          xstyle={styles.search}
        >
          <InputGroup.Start>
            <Icon name='magnifying-glass' />
          </InputGroup.Start>
          <InputGroup.Input
            ref={searchInput}
            type='search'
            autoComplete='off'
            aria-label={m.search}
            placeholder={m.search}
            value={searchValue}
            onChange={event => {
              table.setRowSelection({});
              onSearchChange(event.currentTarget.value);
            }}
          />
          {searchValue ? (
            <InputGroup.End>
              <Button
                aria-label={m.clearSearch}
                onClick={() => {
                  table.setRowSelection({});
                  onSearchChange('');
                  searchInput.current?.focus();
                }}
              >
                <Icon name='x' />
              </Button>
            </InputGroup.End>
          ) : null}
        </InputGroup.Root>
        {onInvite ? <Button onClick={onInvite}>{m.invite}</Button> : null}
      </div>
      <Table.Root
        aria-label={m.title}
        aria-busy={isLoading || isFetching}
      >
        <Table.Header>
          <Table.Row>
            {onBulkAction ? (
              <Table.SelectAllCell
                aria-label={m.selectAll}
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={table.toggleAllRowsSelected}
              />
            ) : null}
            <Table.HeaderCell {...sortHeader('email')}>{m.email}</Table.HeaderCell>
            <Table.HeaderCell {...sortHeader('invitedAt')}>{m.invitedAt}</Table.HeaderCell>
            <Table.HeaderCell {...sortHeader('roleLabel')}>{m.roleLabel}</Table.HeaderCell>
            {onRevoke ? (
              <Table.HeaderCell align='end'>
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.HeaderCell>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Empty colSpan={columnCount}>
              <span role='status'>
                <Spinner />
                <VisuallyHidden>{m.loading}</VisuallyHidden>
              </span>
            </Table.Empty>
          ) : table.rows.length === 0 ? (
            <Table.Empty colSpan={columnCount}>
              <EmptyState.Root>
                <EmptyState.Icon name='envelope' />
                <EmptyState.Label>{query ? m.empty : m.noInvitations}</EmptyState.Label>
                <EmptyState.Description>
                  {query ? fill(m.emptyDescription, { query }) : m.noInvitationsDescription}
                </EmptyState.Description>
              </EmptyState.Root>
            </Table.Empty>
          ) : (
            table.rows.map(row => (
              <Table.Row
                key={row.id}
                selected={Boolean(onBulkAction) && row.getIsSelected()}
              >
                {onBulkAction ? (
                  <Table.SelectCell
                    aria-label={fill(m.select, { name: row.original.email })}
                    checked={row.getIsSelected()}
                    onToggleSelected={row.toggleSelected}
                  />
                ) : null}
                <Table.Cell>
                  <div {...stylex.props(styles.identity)}>
                    <Avatar.Root
                      size='sm'
                      aria-hidden
                    >
                      {row.original.imageUrl ? (
                        <Avatar.Image
                          src={row.original.imageUrl}
                          alt=''
                        />
                      ) : null}
                      <Avatar.Fallback />
                    </Avatar.Root>
                    <Text xstyle={styles.name}>{row.original.email}</Text>
                  </div>
                </Table.Cell>
                <Table.Cell xstyle={styles.dateCell}>{row.original.invitedAtLabel}</Table.Cell>
                <Table.Cell>{row.original.roleLabel}</Table.Cell>
                {onRevoke ? (
                  <Table.Cell align='end'>
                    <Menu.Root placement='bottom-end'>
                      <Menu.Trigger aria-label={fill(m.manage, { name: row.original.email })} />
                      <Menu.Popup>
                        <Menu.Item
                          color='negative'
                          label={m.revoke}
                          onClick={() => onRevoke(row.id)}
                        >
                          <Menu.Label>{m.revoke}</Menu.Label>
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Root>
                  </Table.Cell>
                ) : null}
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
      {totalCount > pageSize || (totalCount > 0 && onPageSizeChange) ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalCount}
          label={m.pagination}
          pageSizeLabel={m.pageSize}
          previousPageLabel={m.previousPage}
          nextPageLabel={m.nextPage}
          onChange={next => {
            table.setRowSelection({});
            onPageChange(next);
          }}
          onPageSizeChange={
            onPageSizeChange
              ? next => {
                  table.setRowSelection({});
                  onPageSizeChange(next);
                  onPageChange(1);
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
