import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Button } from '../../../components/button';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Skeleton } from '../../../components/skeleton';
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import type { OrganizationProfileInvitation } from './invitations-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const PLACEHOLDER_INVITATIONS: OrganizationProfileInvitation[] = [
  {
    id: 'orginv_placeholder_1',
    email: 'jordan.reyes@northwind.co',
    invitedAtLabel: 'Mar 12, 2026',
    roleLabel: 'Member',
  },
  {
    id: 'orginv_placeholder_2',
    email: 'priya.nair@northwind.co',
    invitedAtLabel: 'Apr 3, 2026',
    roleLabel: 'Admin',
  },
  {
    id: 'orginv_placeholder_3',
    email: 'sam.whitfield@northwind.co',
    invitedAtLabel: 'May 21, 2026',
    roleLabel: 'Member',
  },
];

export function InvitationsTableTabSkeleton({
  hasInvite,
  hasRevoke,
  hasBulkAction,
}: {
  hasInvite: boolean;
  hasRevoke: boolean;
  hasBulkAction: boolean;
}) {
  const m = useMessages('organizationProfile').members.invitations;
  return (
    <div
      {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(tableTabStyles.root))}
      role='group'
      aria-label={m.title}
    >
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      {hasInvite ? (
        <Table.Toolbar>
          <Button disabled>
            <Icon glyph={Plus} />
            {m.invite}
          </Button>
        </Table.Toolbar>
      ) : null}
      <Table.Root
        layout='fixed'
        minWidth='35rem'
        aria-label={m.title}
        aria-busy
        selectionMode={hasBulkAction ? 'multiple' : 'none'}
      >
        <Table.Header>
          {hasBulkAction ? <Table.SelectionColumn aria-label={m.selectAll} /> : null}
          <Table.Column>{m.email}</Table.Column>
          <Table.Column width='9rem'>{m.invitedAt}</Table.Column>
          <Table.Column width='8rem'>{m.roleLabel}</Table.Column>
          {hasRevoke ? (
            <Table.Column
              align='end'
              width='4rem'
            >
              <VisuallyHidden>{m.actions}</VisuallyHidden>
            </Table.Column>
          ) : null}
        </Table.Header>
        <Table.Body
          aria-hidden
          {...inertProps(true)}
          items={PLACEHOLDER_INVITATIONS}
          itemToStringValue={invitation => invitation.id}
        >
          {invitation => (
            <Table.Row disabled>
              {hasBulkAction ? <Table.SelectionCell aria-label={invitation.email} /> : null}
              <Table.Cell>
                <Entity.Root>
                  <Entity.Content>
                    <Entity.Label>
                      <Skeleton show>{invitation.email}</Skeleton>
                    </Entity.Label>
                  </Entity.Content>
                </Entity.Root>
              </Table.Cell>
              <Table.Cell noWrap>
                <Skeleton show>{invitation.invitedAtLabel}</Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton show>{invitation.roleLabel}</Skeleton>
              </Table.Cell>
              {hasRevoke ? (
                <Table.Cell align='end'>
                  <Skeleton
                    show
                    visible={false}
                  >
                    <ActionMenu
                      label={invitation.email}
                      disabled
                      actions={[{ label: m.revoke, color: 'negative', onClick: () => undefined }]}
                    />
                  </Skeleton>
                </Table.Cell>
              ) : null}
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
