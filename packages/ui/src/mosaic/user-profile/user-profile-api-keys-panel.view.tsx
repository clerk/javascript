import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Input } from '../components/input';
import { Menu } from '../components/menu';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './user-profile-api-keys-panel.styles';

export interface UserProfileAPIKey {
  id: string;
  name: string;
  expirationLabel: string;
  createdAtLabel: string;
  lastUsedAtLabel: string;
  isExpired?: boolean;
}

export interface UserProfileAPIKeysPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
}

export interface UserProfileApiKeysPanelViewProps {
  apiKeys: UserProfileAPIKey[];
  pagination?: UserProfileAPIKeysPagination;
  searchValue: string;
  selectedIds: readonly string[];
  onCreate?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRevoke?: (id: string) => void;
  onSearchChange: (value: string) => void;
  onSelectionChange: (ids: string[]) => void;
}

export function UserProfileApiKeysPanelView({
  apiKeys,
  pagination,
  searchValue,
  selectedIds,
  onCreate,
  onPageChange,
  onPageSizeChange,
  onRevoke,
  onSearchChange,
  onSelectionChange,
}: UserProfileApiKeysPanelViewProps): ReactElement {
  const allSelected = apiKeys.length > 0 && apiKeys.every(apiKey => selectedIds.includes(apiKey.id));

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : apiKeys.map(apiKey => apiKey.id));
  };

  const toggleOne = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id],
    );
  };

  return (
    <div {...mergeStyleProps(themeProps('user-profile-api-keys-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        API Keys
      </Heading>
      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.searchWrapper)}>
          <Icon
            aria-hidden
            name='search'
            size='sm'
            {...stylex.props(styles.searchIcon)}
          />
          <Input
            aria-label='Search API keys'
            autoComplete='off'
            placeholder='Search'
            size='sm'
            type='search'
            value={searchValue}
            {...stylex.props(styles.search)}
            onChange={event => onSearchChange(event.currentTarget.value)}
          />
        </div>
        {onCreate ? <Button onClick={onCreate}>Create API key</Button> : null}
      </div>
      {/* TODO: Replace this inline implementation with the Mosaic Table component. */}
      <div {...stylex.props(styles.tableShell)}>
        <div {...stylex.props(styles.tableScroller)}>
          <table {...stylex.props(styles.table)}>
            <thead {...stylex.props(styles.header)}>
              <tr>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.checkboxCell)}
                >
                  {/* TODO: Replace these inline selection controls with the Mosaic Checkbox component. */}
                  <input
                    aria-label='Select all API keys'
                    checked={allSelected}
                    type='checkbox'
                    {...stylex.props(styles.checkbox)}
                    onChange={toggleAll}
                  />
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.nameColumn)}
                >
                  Name
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell)}
                >
                  Created
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell)}
                >
                  Last used
                </th>
                <th
                  aria-label='Actions'
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.actionCell)}
                />
              </tr>
            </thead>
            <tbody>
              {apiKeys.length > 0 ? (
                apiKeys.map(apiKey => (
                  <tr
                    key={apiKey.id}
                    {...stylex.props(styles.row)}
                  >
                    <td {...stylex.props(styles.cell, styles.checkboxCell)}>
                      <input
                        aria-label={`Select ${apiKey.name}`}
                        checked={selectedIds.includes(apiKey.id)}
                        type='checkbox'
                        {...stylex.props(styles.checkbox)}
                        onChange={() => toggleOne(apiKey.id)}
                      />
                    </td>
                    <td {...stylex.props(styles.cell)}>
                      <div {...stylex.props(styles.keyName)}>
                        <span>{apiKey.name}</span>
                        {apiKey.isExpired ? <Badge color='warning'>Expired</Badge> : null}
                      </div>
                      <div {...stylex.props(styles.keyDescription)}>{apiKey.expirationLabel}</div>
                    </td>
                    <td {...stylex.props(styles.cell)}>{apiKey.createdAtLabel}</td>
                    <td {...stylex.props(styles.cell)}>{apiKey.lastUsedAtLabel}</td>
                    <td {...stylex.props(styles.cell, styles.actionCell)}>
                      {onRevoke ? (
                        <Menu.Root placement='bottom-end'>
                          <Menu.Trigger aria-label={`Manage ${apiKey.name}`} />
                          <Menu.Content>
                            <Menu.Item
                              color='negative'
                              label='Revoke'
                              onClick={() => onRevoke(apiKey.id)}
                            />
                          </Menu.Content>
                        </Menu.Root>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr {...stylex.props(styles.row)}>
                  <td
                    colSpan={5}
                    {...stylex.props(styles.emptyCell)}
                  >
                    No API keys found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination ? (
        // TODO: Replace this inline implementation with the Mosaic Pagination component.
        <div {...stylex.props(styles.pagination)}>
          <div {...stylex.props(styles.paginationControls)}>
            <Button
              aria-label='Previous API keys page'
              color='neutral'
              disabled={pagination.page <= 1}
              shape='square'
              size='sm'
              touchTarget={false}
              variant='ghost'
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <Icon name='chevron-left' />
            </Button>
            <Button
              aria-current='page'
              aria-label={`API keys page ${pagination.page}`}
              color='neutral'
              shape='square'
              size='sm'
              touchTarget={false}
              variant='ghost'
            >
              {pagination.page}
            </Button>
            <Button
              aria-label='Next API keys page'
              color='neutral'
              disabled={pagination.page >= pagination.pageCount}
              shape='square'
              size='sm'
              touchTarget={false}
              variant='ghost'
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <Icon name='chevron-right' />
            </Button>
          </div>
          <label {...stylex.props(styles.pageSizeLabel)}>
            <span>Results per page</span>
            {/* TODO: Replace this inline implementation with the Mosaic Select component. */}
            <select
              aria-label='Results per page'
              value={pagination.pageSize}
              {...stylex.props(styles.pageSizeSelect)}
              onChange={event => onPageSizeChange?.(Number(event.currentTarget.value))}
            >
              {(pagination.pageSizeOptions ?? [10, 25, 50]).map(pageSize => (
                <option
                  key={pageSize}
                  value={pageSize}
                >
                  {pageSize}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
