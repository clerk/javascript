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
  const m = useMessages('invitationsTableTab');
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
      >
        <Table.ColumnGroup>
          {hasBulkAction ? <Table.Column /> : null}
          <Table.Column />
          <Table.Column width='9rem' />
          <Table.Column width='8rem' />
          {hasRevoke ? <Table.Column width='4rem' /> : null}
        </Table.ColumnGroup>
        <Table.Header>
          <Table.Row>
            {hasBulkAction ? (
              <Table.SelectAllCell
                aria-label={m.selectAll}
                checked={false}
                disabled
              />
            ) : null}
            <Table.HeaderCell>{m.email}</Table.HeaderCell>
            <Table.HeaderCell>{m.invitedAt}</Table.HeaderCell>
            <Table.HeaderCell>{m.roleLabel}</Table.HeaderCell>
            {hasRevoke ? (
              <Table.HeaderCell align='end'>
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.HeaderCell>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body
          aria-hidden
          {...inertProps(true)}
        >
          {PLACEHOLDER_INVITATIONS.map(invitation => (
            <Table.Row key={invitation.id}>
              {hasBulkAction ? (
                <Table.SelectCell
                  aria-label={invitation.email}
                  checked={false}
                  disabled
                />
              ) : null}
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
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
