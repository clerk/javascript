import * as stylex from '@stylexjs/stylex';
import { useRef } from 'react';

import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { panelStyles } from '../../components/profile';
import { Select } from '../../components/select';
import { Spinner } from '../../components/spinner';
import { Table, type TableHeaderCellProps } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { fill, useMessages } from '../../localization';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './members-table-tab.styles';
import type { MembersTableSort, MembersTableTabViewProps, OrganizationProfileMember } from './members-table-tab.types';

const getRowId = (member: OrganizationProfileMember) => member.id;
const canManageMember = (member: OrganizationProfileMember) => !member.isCurrentUser && !member.isDeprovisioned;

export function MembersTableTabView({
  members,
  roles,
  onInvite,
  onRemove,
  onChangeRole,
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
}: MembersTableTabViewProps) {
  const m = useMessages('membersTableTab');
  const searchInput = useRef<HTMLInputElement>(null);
  const table = useDataTable({ data: members, getRowId, totalCount });
  const selectableRows = table.rows.filter(row => canManageMember(row.original));
  const allSelected = selectableRows.length > 0 && selectableRows.every(row => row.getIsSelected());
  const columnCount = 3 + Number(Boolean(onRemove)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const sortHeader = (column: MembersTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => ({
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
    <div {...mergeStyleProps(themeProps('members-table-tab'), stylex.props(panelStyles.root))}>
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
                checked={allSelected}
                indeterminate={!allSelected && selectableRows.some(row => row.getIsSelected())}
                onChange={() =>
                  table.setRowSelection(Object.fromEntries(selectableRows.map(row => [row.id, !allSelected])))
                }
              />
            ) : null}
            <Table.HeaderCell {...sortHeader('name')}>{m.name}</Table.HeaderCell>
            <Table.HeaderCell {...sortHeader('joinedAt')}>{m.joinedAt}</Table.HeaderCell>
            <Table.HeaderCell {...sortHeader('role')}>{m.role}</Table.HeaderCell>
            {onRemove ? (
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
                <EmptyState.Icon name='users' />
                <EmptyState.Label>{query ? m.empty : m.noMembers}</EmptyState.Label>
                <EmptyState.Description>
                  {query ? fill(m.emptyDescription, { query }) : m.noMembersDescription}
                </EmptyState.Description>
              </EmptyState.Root>
            </Table.Empty>
          ) : (
            table.rows.map(row => {
              const member = row.original;
              return (
                <Table.Row
                  key={member.id}
                  selected={Boolean(onBulkAction) && canManageMember(member) && row.getIsSelected()}
                >
                  {onBulkAction ? (
                    <Table.SelectCell
                      aria-label={fill(m.select, { name: member.name })}
                      checked={canManageMember(member) && row.getIsSelected()}
                      disabled={!canManageMember(member)}
                      onToggleSelected={canManageMember(member) ? row.toggleSelected : undefined}
                    />
                  ) : null}
                  <Table.Cell>
                    <div {...stylex.props(styles.identity)}>
                      <Avatar.Root
                        size='sm'
                        aria-hidden
                      >
                        {member.imageUrl ? (
                          <Avatar.Image
                            src={member.imageUrl}
                            alt=''
                          />
                        ) : null}
                        <Avatar.Fallback />
                      </Avatar.Root>
                      <div {...stylex.props(styles.metadata)}>
                        <Text xstyle={styles.name}>
                          {member.name}
                          {member.isCurrentUser ? (
                            <Badge>{m.you}</Badge>
                          ) : member.isDeprovisioned ? (
                            <Badge>{m.deprovisioned}</Badge>
                          ) : member.isBanned ? (
                            <Badge color='negative'>{m.banned}</Badge>
                          ) : null}
                        </Text>
                        <Text
                          size='xs'
                          color='foreground-secondary'
                        >
                          {member.email}
                        </Text>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell xstyle={styles.dateCell}>{member.joinedAtLabel}</Table.Cell>
                  <Table.Cell>
                    {onChangeRole && canManageMember(member) ? (
                      <Select.Root
                        items={roles}
                        value={member.role}
                        onValueChange={value => {
                          if (value) {
                            onChangeRole(member.id, value);
                          }
                        }}
                      >
                        <Select.Trigger
                          variant='ghost'
                          aria-label={fill(m.changeRole, { name: member.name })}
                          placeholder={member.roleLabel}
                        />
                        <Select.Popup />
                      </Select.Root>
                    ) : (
                      member.roleLabel
                    )}
                  </Table.Cell>
                  {onRemove ? (
                    <Table.Cell align='end'>
                      {!canManageMember(member) ? null : (
                        <Menu.Root placement='bottom-end'>
                          <Menu.Trigger aria-label={fill(m.manage, { name: member.name })} />
                          <Menu.Popup>
                            <Menu.Item
                              color='negative'
                              label={m.remove}
                              onClick={() => onRemove(member.id)}
                            >
                              <Menu.Label>{m.remove}</Menu.Label>
                            </Menu.Item>
                          </Menu.Popup>
                        </Menu.Root>
                      )}
                    </Table.Cell>
                  ) : null}
                </Table.Row>
              );
            })
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
