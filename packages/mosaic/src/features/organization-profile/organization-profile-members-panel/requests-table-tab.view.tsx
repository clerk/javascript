import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useState } from 'react';

import { Avatar } from '../../../components/avatar';
import { Button, SubmitButton } from '../../../components/button';
import { EmptyState } from '../../../components/empty-state';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Pagination } from '../../../components/pagination';
import { Section } from '../../../components/section';
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { Users } from '../../../icons/glyphs/users';
import { fill, useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './requests-table-tab.styles';
import type { OrganizationProfileRequest, RequestsTableTabViewProps } from './requests-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (request: OrganizationProfileRequest) => request.id;

export function RequestsTableTabView({
  requests,
  inviteButtonRef,
  tableContainerRef,
  onInvite,
  isInviteDisabled,
  registerAcceptTrigger,
  registerDeclineTrigger,
  onAccept,
  onDecline,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onBulkAction,
  isFetching = false,
  isError = false,
  onRetry,
}: RequestsTableTabViewProps) {
  const m = useMessages('organizationProfile').members.requests;
  const showPagination = Math.ceil(totalCount / pageSize) > 1;
  const hasActions = Boolean(onAccept || onDecline);
  return (
    <div
      {...mergeStyleProps(themeProps('requests-table-tab'), stylex.props(tableTabStyles.root))}
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
        minWidth='33rem'
        aria-label={m.title}
        aria-busy={isFetching}
        selectionMode={onBulkAction ? 'multiple' : 'none'}
      >
        <Table.Header>
          {onBulkAction ? <Table.SelectionColumn aria-label={m.selectAll} /> : null}
          <Table.Column>{m.email}</Table.Column>
          <Table.Column width='9rem'>{m.requestedAt}</Table.Column>
          {hasActions ? (
            <Table.Column
              align='end'
              width='10rem'
            >
              <VisuallyHidden>{m.actions}</VisuallyHidden>
            </Table.Column>
          ) : null}
        </Table.Header>
        <RequestsTableBody
          requests={isError ? [] : requests}
          isError={isError}
          onRetry={onRetry}
          hasActions={hasActions}
          hasBulkAction={Boolean(onBulkAction)}
          onAccept={onAccept}
          onDecline={onDecline}
          registerAcceptTrigger={registerAcceptTrigger}
          registerDeclineTrigger={registerDeclineTrigger}
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
  );
}

function RequestsTableBody({
  requests,
  isError,
  onRetry,
  hasActions,
  hasBulkAction,
  onAccept,
  onDecline,
  registerAcceptTrigger,
  registerDeclineTrigger,
}: {
  requests: OrganizationProfileRequest[];
  isError: boolean;
  onRetry?: () => void;
  hasActions: boolean;
  hasBulkAction: boolean;
  onAccept?: RequestsTableTabViewProps['onAccept'];
  onDecline?: RequestsTableTabViewProps['onDecline'];
  registerAcceptTrigger?: (id: string) => Ref<HTMLButtonElement>;
  registerDeclineTrigger?: (id: string) => Ref<HTMLButtonElement>;
}) {
  const m = useMessages('organizationProfile').members.requests;
  return (
    <Table.Body
      items={requests}
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
            <EmptyState.Icon glyph={Users} />
            <EmptyState.Label>{m.noRequests}</EmptyState.Label>
            <EmptyState.Description>{m.noRequestsDescription}</EmptyState.Description>
          </EmptyState.Root>
        )
      }
    >
      {request => (
        <Table.Row>
          {hasBulkAction ? <Table.SelectionCell aria-label={fill(m.select, { name: request.email })} /> : null}
          <Table.Cell>
            <Entity.Root>
              <Entity.Media>
                <Avatar.Root
                  size='fit'
                  aria-hidden
                >
                  {request.imageUrl ? (
                    <Avatar.Image
                      src={request.imageUrl}
                      alt=''
                    />
                  ) : null}
                  <Avatar.Fallback />
                </Avatar.Root>
              </Entity.Media>
              <Entity.Content>
                <Entity.Label>{request.name ?? request.email}</Entity.Label>
                {request.name ? <Entity.Description>{request.email}</Entity.Description> : null}
              </Entity.Content>
            </Entity.Root>
          </Table.Cell>
          <Table.Cell noWrap>{request.requestedAtLabel}</Table.Cell>
          {hasActions ? (
            <Table.Cell align='end'>
              <RequestActions
                request={request}
                onAccept={onAccept ? () => onAccept(request.id) : undefined}
                onDecline={onDecline ? () => onDecline(request.id) : undefined}
                registerAcceptTrigger={registerAcceptTrigger}
                registerDeclineTrigger={registerDeclineTrigger}
              />
            </Table.Cell>
          ) : null}
        </Table.Row>
      )}
    </Table.Body>
  );
}

function RequestActions({
  request,
  onAccept,
  onDecline,
  registerAcceptTrigger,
  registerDeclineTrigger,
}: {
  request: OrganizationProfileRequest;
  onAccept?: () => void | Promise<void>;
  onDecline?: () => void | Promise<void>;
  registerAcceptTrigger?: (id: string) => Ref<HTMLButtonElement>;
  registerDeclineTrigger?: (id: string) => Ref<HTMLButtonElement>;
}) {
  const m = useMessages('organizationProfile').members.requests;
  const [acceptRef] = useState(() => registerAcceptTrigger?.(request.id));
  const [declineRef] = useState(() => registerDeclineTrigger?.(request.id));
  const actions = usePendingAction<'accept' | 'decline'>();
  const pendingAction = request.pendingAction ?? actions.pendingKey;
  const decide = (key: 'accept' | 'decline', action: () => void | Promise<void>, errorFallback: string) => {
    if (pendingAction) {
      return;
    }
    void actions.run(key, action, { errorFallback });
  };
  return (
    <>
      <div {...stylex.props(styles.actions)}>
        {onDecline ? (
          <SubmitButton
            ref={declineRef}
            type='button'
            size='sm'
            disabled={pendingAction === 'accept'}
            isPending={pendingAction === 'decline'}
            pendingLabel={m.declining}
            variant='outline'
            color='neutral'
            aria-label={fill(m.declineRequest, { name: request.name ?? request.email })}
            onClick={() => decide('decline', onDecline, m.declineError)}
          >
            {m.decline}
          </SubmitButton>
        ) : null}
        {onAccept ? (
          <SubmitButton
            ref={acceptRef}
            type='button'
            size='sm'
            disabled={pendingAction === 'decline'}
            isPending={pendingAction === 'accept'}
            pendingLabel={m.accepting}
            aria-label={fill(m.acceptRequest, { name: request.name ?? request.email })}
            onClick={() => decide('accept', onAccept, m.acceptError)}
          >
            {m.accept}
          </SubmitButton>
        ) : null}
      </div>
      <Section.Error>{actions.error}</Section.Error>
    </>
  );
}
