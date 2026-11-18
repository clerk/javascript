import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Badge } from '../../../components/badge';
import { Banner } from '../../../components/banner';
import { Button } from '../../../components/button';
import { EmptyState } from '../../../components/empty-state';
import { Entity } from '../../../components/entity';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Table } from '../../../components/table';
import { Text } from '../../../components/text';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { Users } from '../../../icons/glyphs/users';
import { fill, useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './organization-profile-security-panel.styles';
import type { SSOBypassPageController, SSOBypassRow } from './sso-bypass.controller';
import { SSOBypassAddDialog } from './sso-bypass-add.dialog';

const getRowId = (row: SSOBypassRow) => row.userId;

export type SSOBypassPageViewProps = SSOBypassPageController;

export function SSOBypassPageView({
  rows,
  search,
  onSearchChange,
  isError,
  onRetry,
  isDisabled,
  removeError,
  onRemove,
  registerTrigger,
  tableRef,
  addButtonRef,
  onAdd,
  addDialog,
}: SSOBypassPageViewProps) {
  const m = useMessages('organizationProfile').security.ssoBypassPage;
  const searchRef = useFlowAutoFocus<HTMLInputElement>();

  return (
    <>
      <div
        ref={tableRef}
        tabIndex={-1}
        {...mergeStyleProps(themeProps('organization-profile-sso-bypass'), stylex.props(styles.page))}
      >
        <Text color='foreground-secondary'>{m.description}</Text>
        <Table.Toolbar>
          <Table.Search
            ref={searchRef}
            label={m.search}
            clearLabel={m.clearSearch}
            value={search}
            onValueChange={onSearchChange}
          />
          <Button
            ref={addButtonRef}
            onClick={onAdd}
          >
            <Icon glyph={Plus} />
            {m.add}
          </Button>
        </Table.Toolbar>
        {removeError ? (
          <Banner.Root
            color='negative'
            role='alert'
          >
            <Banner.Label>{removeError}</Banner.Label>
          </Banner.Root>
        ) : null}
        {isError ? null : <VisuallyHidden role='status'>{m.loaded}</VisuallyHidden>}
        <Table.Root
          layout='fixed'
          aria-label={m.tableLabel}
        >
          <Table.Header>
            <Table.Column>{m.user}</Table.Column>
            <Table.Column
              align='end'
              width='4rem'
            >
              <VisuallyHidden>{m.actions}</VisuallyHidden>
            </Table.Column>
          </Table.Header>
          <Table.Body
            items={isError ? [] : rows}
            itemToStringValue={getRowId}
            renderEmptyState={() =>
              isError ? (
                <EmptyState.Root role='alert'>
                  <EmptyState.Icon glyph={ExclamationCircle} />
                  <EmptyState.Label>{m.loadError}</EmptyState.Label>
                  <EmptyState.Actions>
                    <Button onClick={onRetry}>{m.retry}</Button>
                  </EmptyState.Actions>
                </EmptyState.Root>
              ) : (
                <EmptyState.Root role='status'>
                  <EmptyState.Icon glyph={Users} />
                  <EmptyState.Label>{search.trim() ? m.emptySearch : m.empty}</EmptyState.Label>
                </EmptyState.Root>
              )
            }
          >
            {row => (
              <SSOBypassRowView
                row={row}
                isDisabled={isDisabled}
                onRemove={() => onRemove(row.userId)}
                triggerRef={registerTrigger(row.userId)}
              />
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <SSOBypassAddDialog {...addDialog} />
    </>
  );
}

function SSOBypassRowView({
  row,
  isDisabled,
  onRemove,
  triggerRef,
}: {
  row: SSOBypassRow;
  isDisabled: boolean;
  onRemove: () => void;
  triggerRef: Ref<HTMLButtonElement>;
}) {
  const m = useMessages('organizationProfile').security.ssoBypassPage;
  return (
    <Table.Row>
      <Table.Cell>
        <Entity.Root>
          <Entity.Media>
            <Avatar.Root
              size='fit'
              aria-hidden
            >
              {row.imageUrl ? (
                <Avatar.Image
                  src={row.imageUrl}
                  alt=''
                />
              ) : null}
              <Avatar.Fallback />
            </Avatar.Root>
          </Entity.Media>
          <Entity.Content>
            <Entity.Label>
              {row.name}
              {row.isCurrentUser ? <Badge color='neutral'>{m.you}</Badge> : null}
            </Entity.Label>
            <Entity.Description>{row.identifier}</Entity.Description>
          </Entity.Content>
        </Entity.Root>
      </Table.Cell>
      <Table.Cell align='end'>
        <ActionMenu
          label={fill(m.manageLabel, { name: row.name })}
          triggerRef={triggerRef}
          disabled={isDisabled}
          focusableWhenDisabled
          actions={[
            {
              label: m.remove,
              color: 'negative',
              onClick: onRemove,
            },
          ]}
        />
      </Table.Cell>
    </Table.Row>
  );
}
