import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { ActionMenu } from '../../components/action-menu';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Item } from '../../components/item';
import { Pagination } from '../../components/pagination';
import { panelStyles } from '../../components/profile';
import { Select } from '../../components/select';
import { Spinner } from '../../components/spinner';
import { Table, type TableHeaderCellProps } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
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
  const inviteButton = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: members.filter(canManageMember).map(getRowId),
    onRemove,
    fallback: () => inviteButton.current ?? searchInput.current,
  });
  const removeDialog = useMemo(() => Confirmation.createHandle<OrganizationProfileMember>(), []);
  const pagination = { pageIndex: page - 1, pageSize };
  const table = useDataTable({
    data: members,
    totalCount,
    getRowId,
    isRowSelectable: canManageMember,
    sorting: sort ? [{ id: sort.column, desc: sort.direction === 'descending' }] : [],
    onSortingChange: onSortChange
      ? update => {
          const next = typeof update === 'function' ? update(table.sorting) : update;
          const active = next[0];
          table.setRowSelection({});
          onSortChange(
            active && (active.id === 'name' || active.id === 'joinedAt' || active.id === 'role')
              ? { column: active.id, direction: active.desc ? 'descending' : 'ascending' }
              : null,
          );
        }
      : undefined,
    pagination,
    onPaginationChange: update => {
      const next = typeof update === 'function' ? update(pagination) : update;
      table.setRowSelection({});
      if (next.pageSize !== pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
      onPageChange(next.pageIndex + 1);
    },
    globalFilter: searchValue,
    onGlobalFilterChange: update => {
      table.setRowSelection({});
      onSearchChange(typeof update === 'function' ? update(searchValue) : update);
    },
  });
  const resetSelection = useRef(table.setRowSelection);
  useEffect(() => {
    resetSelection.current = table.setRowSelection;
  }, [table.setRowSelection]);
  useEffect(() => {
    resetSelection.current({});
  }, [page, pageSize, searchValue, sort?.column, sort?.direction]);
  const sortHeader = (column: MembersTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => {
    const active = table.sorting[0];
    return {
      sort: active?.id === column ? (active.desc ? 'descending' : 'ascending') : 'none',
      onSort: onSortChange
        ? () =>
            table.setSorting(current => {
              const active = current[0];
              if (active?.id !== column) {
                return [{ id: column, desc: false }];
              }
              return active.desc ? [] : [{ id: column, desc: true }];
            })
        : undefined,
    };
  };
  const columnCount = 3 + Number(Boolean(onRemove)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  return (
    <>
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
              value={table.globalFilter}
              onChange={event => table.setGlobalFilter(event.currentTarget.value)}
            />
            {table.globalFilter ? (
              <InputGroup.End>
                <Button
                  aria-label={m.clearSearch}
                  onClick={() => {
                    table.setGlobalFilter('');
                    searchInput.current?.focus();
                  }}
                >
                  <Icon name='x' />
                </Button>
              </InputGroup.End>
            ) : null}
          </InputGroup.Root>
          {onInvite ? (
            <Button
              ref={inviteButton}
              onClick={onInvite}
            >
              {m.invite}
            </Button>
          ) : null}
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
                <EmptyState.Root role='status'>
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
                      <Item.Root xstyle={styles.identity}>
                        <Item.Media>
                          <Avatar.Root
                            size='fit'
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
                        </Item.Media>
                        <Item.Content xstyle={styles.metadata}>
                          <Item.Label xstyle={styles.name}>
                            {member.name}
                            {member.isCurrentUser ? (
                              <Badge>{m.you}</Badge>
                            ) : member.isDeprovisioned ? (
                              <Badge>{m.deprovisioned}</Badge>
                            ) : member.isBanned ? (
                              <Badge color='negative'>{m.banned}</Badge>
                            ) : null}
                          </Item.Label>
                          <Item.Description>{member.email}</Item.Description>
                        </Item.Content>
                      </Item.Root>
                    </Table.Cell>
                    <Table.Cell xstyle={styles.dateCell}>{member.joinedAtLabel}</Table.Cell>
                    <Table.Cell>
                      {onChangeRole && !member.isDeprovisioned ? (
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
                            disabled={member.isCurrentUser}
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
                          <ActionMenu
                            label={fill(m.manage, { name: member.name })}
                            triggerRef={removalFocus.registerTrigger(member.id)}
                            actions={[
                              {
                                label: m.remove,
                                color: 'negative',
                                onClick: () => removeDialog.open(member),
                              },
                            ]}
                          />
                        )}
                      </Table.Cell>
                    ) : null}
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
        {table.getPageCount() > 1 || (totalCount > 0 && onPageSizeChange) ? (
          <Pagination
            page={table.pagination.pageIndex + 1}
            pageSize={table.pagination.pageSize}
            totalItems={totalCount}
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
            onChange={next => table.setPagination(current => ({ ...current, pageIndex: next - 1 }))}
            onPageSizeChange={
              onPageSizeChange ? next => table.setPagination({ pageIndex: 0, pageSize: next }) : undefined
            }
          />
        ) : null}
      </div>
      {onRemove ? (
        <Confirmation
          handle={removeDialog}
          title={member => fill(m.removeTitle, { name: member.name })}
          description={m.removeDescription}
          actionLabel={m.remove}
          cancelLabel={m.cancel}
          onConfirm={async member => {
            try {
              await removalFocus.remove(member.id);
            } catch (error) {
              throw error instanceof Error ? error : new Error(m.removeError);
            }
          }}
          finalFocus={removalFocus.finalFocus}
        />
      ) : null}
    </>
  );
}
