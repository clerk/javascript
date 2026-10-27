import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useState } from 'react';

import { Destructive } from '../../blocks/destructive';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { ExclamationCircle } from '../../icons/glyphs/exclamation-circle';
import { Key } from '../../icons/glyphs/key';
import { fill } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { truncateWithEndVisible } from '../../utils/truncate-text-with-end-visible';
import { styles } from './api-keys-table.styles';
import type { APIKey, APIKeysTableMessages, APIKeysTableViewProps } from './api-keys-table.types';
import { CreateAPIKeyDialog } from './create-api-key.dialog';

const getRowId = (row: APIKey) => row.id;

export function APIKeysTableView({
  messages: m,
  apiKeys,
  totalCount,
  page,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  searchInputRef,
  createButtonRef,
  onCreate,
  createDialog,
  registerTrigger,
  revoke,
  finalFocus,
  onBulkAction,
  isFetching = false,
  isError = false,
  onRetry,
}: APIKeysTableViewProps) {
  const showPagination = Math.ceil(totalCount / pageSize) > 1 || (totalCount > 0 && Boolean(onPageSizeChange));
  const query = searchValue.trim();
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noKeys, description: m.noKeysDescription };
  return (
    <>
      <div {...mergeStyleProps(themeProps('api-keys-table'), stylex.props(styles.root))}>
        <VisuallyHidden role='status'>{isError ? m.loadError : m.loaded}</VisuallyHidden>
        <Table.Toolbar>
          <Table.Search
            ref={searchInputRef}
            label={m.search}
            clearLabel={m.clearSearch}
            value={searchValue}
            onValueChange={onSearchChange}
          />
          {onCreate ? (
            <Button
              ref={createButtonRef}
              onClick={onCreate}
            >
              {m.create}
            </Button>
          ) : null}
        </Table.Toolbar>
        <Table.Root
          aria-label={m.title}
          aria-busy={isFetching}
          layout='fixed'
          minWidth='36rem'
          selectionMode={onBulkAction ? 'multiple' : 'none'}
        >
          <Table.Header>
            {onBulkAction ? <Table.SelectionColumn aria-label={m.selectAll} /> : null}
            <Table.Column>{m.name}</Table.Column>
            <Table.Column width='9rem'>{m.createdAt}</Table.Column>
            <Table.Column width='9rem'>{m.lastUsed}</Table.Column>
            {revoke ? (
              <Table.Column
                align='end'
                width='4rem'
              >
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.Column>
            ) : null}
          </Table.Header>
          <Table.Body
            items={isError ? [] : apiKeys}
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
                  <EmptyState.Icon glyph={Key} />
                  <EmptyState.Label>{emptyState.label}</EmptyState.Label>
                  <EmptyState.Description>{emptyState.description}</EmptyState.Description>
                </EmptyState.Root>
              )
            }
          >
            {apiKey => (
              <Table.Row>
                {onBulkAction ? <Table.SelectionCell aria-label={fill(m.select, { name: apiKey.name })} /> : null}
                <Table.Cell>
                  <APIKeyMetadata
                    messages={m}
                    apiKey={apiKey}
                  />
                </Table.Cell>
                <Table.Cell noWrap>
                  <Text>{apiKey.createdAtLabel}</Text>
                </Table.Cell>
                <Table.Cell noWrap>
                  <Text>{apiKey.lastUsedAtLabel ?? m.neverUsed}</Text>
                </Table.Cell>
                {revoke ? (
                  <Table.Cell align='end'>
                    <APIKeyActions
                      messages={m}
                      apiKey={apiKey}
                      registerTrigger={registerTrigger}
                      onSelect={key => revoke.open(key)}
                    />
                  </Table.Cell>
                ) : null}
              </Table.Row>
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
      {createDialog ? <CreateAPIKeyDialog {...createDialog} /> : null}
      {revoke ? (
        <Destructive
          controller={revoke}
          title={apiKey => fill(m.revokeTitle, { name: apiKey.name })}
          description={m.revokeDescription}
          fieldLabel={apiKey => fill(m.revokeFieldLabel, { name: apiKey.name })}
          confirmationValue={apiKey => apiKey.name}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}

function APIKeyMetadata({ messages: m, apiKey }: { messages: APIKeysTableMessages; apiKey: APIKey }) {
  const id = truncateWithEndVisible(apiKey.id, 10, 4);
  const expiry =
    apiKey.expiresAtLabel === null
      ? m.neverExpires
      : fill(m.expires, {
          expiresDate: apiKey.expiresAtLabel,
        });
  return (
    <div {...stylex.props(styles.metadata)}>
      <Text xstyle={styles.name}>{apiKey.name}</Text>
      <Text
        size='xs'
        color='foreground-secondary'
      >
        {id} ·{' '}
        <Text
          render={<span />}
          size='xs'
          color={apiKey.expiresAtLabel === null ? 'foreground-secondary' : 'warning'}
        >
          {expiry}
        </Text>
      </Text>
    </div>
  );
}

function APIKeyActions({
  messages: m,
  apiKey,
  registerTrigger,
  onSelect,
}: {
  messages: APIKeysTableMessages;
  apiKey: APIKey;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  onSelect: (key: APIKey) => void;
}) {
  const [triggerRef] = useState(() => registerTrigger(apiKey.id));
  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger
        ref={triggerRef}
        aria-label={fill(m.manage, { name: apiKey.name })}
      />
      <Menu.Popup>
        <Menu.Item
          color='negative'
          label={m.revoke}
          onClick={() => onSelect(apiKey)}
        >
          <Menu.Label>{m.revoke}</Menu.Label>
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
