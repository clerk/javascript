import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { ActionMenu } from '../../../components/action-menu';
import { Button } from '../../../components/button';
import { EmptyState } from '../../../components/empty-state';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Pagination } from '../../../components/pagination';
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { Envelope } from '../../../icons/glyphs/envelope';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { fill, useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import type { InvitationsTableTabViewProps, OrganizationProfileInvitation } from './invitations-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (invitation: OrganizationProfileInvitation) => invitation.id;

export function InvitationsTableTabView({
  invitations,
  inviteButtonRef,
  tableContainerRef,
  onInvite,
  isInviteDisabled,
  registerTrigger,
  revoke,
  finalFocus,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onBulkAction,
  isFetching = false,
  isError = false,
  onRetry,
}: InvitationsTableTabViewProps) {
  const m = useMessages('invitationsTableTab');
  const showPagination = Math.ceil(totalCount / pageSize) > 1;
  return (
    <>
      <div
        {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(tableTabStyles.root))}
        ref={tableContainerRef}
        tabIndex={-1}
        role='group'
        aria-label={m.title}
      >
        {isError ? null : <VisuallyHidden role='status'>{m.loaded}</VisuallyHidden>}
        {onInvite ? (
          <Table.Toolbar>
            <Button
              ref={inviteButtonRef}
              disabled={isInviteDisabled}
              focusableWhenDisabled
              onClick={onInvite}
            >
              <Icon glyph={Plus} />
              {m.invite}
            </Button>
          </Table.Toolbar>
        ) : null}
        <Table.Root
          layout='fixed'
          minWidth='35rem'
          aria-label={m.title}
          aria-busy={isFetching}
          selectionMode={onBulkAction ? 'multiple' : 'none'}
        >
          <Table.Header>
            {onBulkAction ? <Table.SelectionColumn aria-label={m.selectAll} /> : null}
            <Table.Column>{m.email}</Table.Column>
            <Table.Column width='9rem'>{m.invitedAt}</Table.Column>
            <Table.Column width='8rem'>{m.roleLabel}</Table.Column>
            {revoke ? (
              <Table.Column
                align='end'
                width='4rem'
              >
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.Column>
            ) : null}
          </Table.Header>
          <InvitationsTableBody
            invitations={isError ? [] : invitations}
            isError={isError}
            onRetry={onRetry}
            hasBulkAction={Boolean(onBulkAction)}
            onRevokeClick={revoke ? invitation => revoke.open(invitation) : undefined}
            registerTrigger={registerTrigger}
          />
        </Table.Root>
        {showPagination ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalCount}
            disabled={isFetching}
            onChange={onPageChange}
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
          />
        ) : null}
      </div>
      {revoke ? (
        <Confirmation
          controller={revoke}
          title={invitation => fill(m.revokeTitle, { name: invitation.email })}
          description={m.revokeDescription}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}

function InvitationsTableBody({
  invitations,
  isError,
  onRetry,
  hasBulkAction,
  onRevokeClick,
  registerTrigger,
}: {
  invitations: OrganizationProfileInvitation[];
  isError: boolean;
  onRetry?: () => void;
  hasBulkAction: boolean;
  onRevokeClick?: (invitation: OrganizationProfileInvitation) => void;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
}) {
  const m = useMessages('invitationsTableTab');
  return (
    <Table.Body
      items={invitations}
      itemToStringValue={getRowId}
      renderEmptyState={() =>
        isError ? (
          <EmptyState.Root role='alert'>
            <EmptyState.Icon glyph={ExclamationCircle} />
            <EmptyState.Label>{m.loadError}</EmptyState.Label>
            {onRetry ? (
              <EmptyState.Actions>
                <Button onClick={onRetry}>{m.retry}</Button>
              </EmptyState.Actions>
            ) : null}
          </EmptyState.Root>
        ) : (
          <EmptyState.Root role='status'>
            <EmptyState.Icon glyph={Envelope} />
            <EmptyState.Label>{m.noInvitations}</EmptyState.Label>
            <EmptyState.Description>{m.noInvitationsDescription}</EmptyState.Description>
          </EmptyState.Root>
        )
      }
    >
      {invitation => (
        <Table.Row>
          {hasBulkAction ? <Table.SelectionCell aria-label={fill(m.select, { name: invitation.email })} /> : null}
          <Table.Cell>
            <Entity.Root>
              <Entity.Content>
                <Entity.Label>{invitation.email}</Entity.Label>
              </Entity.Content>
            </Entity.Root>
          </Table.Cell>
          <Table.Cell noWrap>{invitation.invitedAtLabel}</Table.Cell>
          <Table.Cell>{invitation.roleLabel}</Table.Cell>
          {onRevokeClick ? (
            <Table.Cell align='end'>
              <ActionMenu
                label={fill(m.manage, { name: invitation.email })}
                triggerRef={registerTrigger(invitation.id)}
                actions={[
                  {
                    label: m.revoke,
                    color: 'negative',
                    onClick: () => onRevokeClick(invitation),
                  },
                ]}
              />
            </Table.Cell>
          ) : null}
        </Table.Row>
      )}
    </Table.Body>
  );
}
