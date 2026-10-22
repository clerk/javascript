import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Skeleton } from '../../../components/skeleton';
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { Plus } from '../../../icons/glyphs/plus';
import { useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import type { OrganizationProfileMember } from './members-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const PLACEHOLDER_MEMBERS: OrganizationProfileMember[] = [
  {
    id: 'orgmem_placeholder_1',
    name: 'Jordan Reyes',
    email: 'jordan.reyes@northwind.co',
    joinedAtLabel: 'Mar 12, 2026',
    role: 'org:admin',
    roleLabel: 'Admin',
  },
  {
    id: 'orgmem_placeholder_2',
    name: 'Priya Nair',
    email: 'priya.nair@northwind.co',
    joinedAtLabel: 'Apr 3, 2026',
    role: 'org:member',
    roleLabel: 'Member',
  },
  {
    id: 'orgmem_placeholder_3',
    name: 'Sam Whitfield',
    email: 'sam.whitfield@northwind.co',
    joinedAtLabel: 'May 21, 2026',
    role: 'org:member',
    roleLabel: 'Member',
  },
];

export function MembersTableTabSkeleton({
  hasInvite,
  hasRemove,
  hasBulkAction,
}: {
  hasInvite: boolean;
  hasRemove: boolean;
  hasBulkAction: boolean;
}) {
  const m = useMessages('membersTableTab');
  return (
    <div {...mergeStyleProps(themeProps('members-table-tab'), stylex.props(tableTabStyles.root))}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Table.Toolbar>
        <Table.Search
          label={m.search}
          clearLabel={m.clearSearch}
          value=''
          onValueChange={() => undefined}
          disabled
        />
        {hasInvite ? (
          <Button disabled>
            <Icon glyph={Plus} />
            {m.invite}
          </Button>
        ) : null}
      </Table.Toolbar>
      <Table.Root
        layout='fixed'
        minWidth='37rem'
        aria-label={m.title}
        aria-busy
      >
        <Table.ColumnGroup>
          {hasBulkAction ? <Table.Column /> : null}
          <Table.Column />
          <Table.Column width='9rem' />
          <Table.Column width='10rem' />
          {hasRemove ? <Table.Column width='4rem' /> : null}
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
            <Table.HeaderCell>{m.name}</Table.HeaderCell>
            <Table.HeaderCell>{m.joinedAt}</Table.HeaderCell>
            <Table.HeaderCell>{m.role}</Table.HeaderCell>
            {hasRemove ? (
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
          {PLACEHOLDER_MEMBERS.map(member => (
            <Table.Row key={member.id}>
              {hasBulkAction ? (
                <Table.SelectCell
                  aria-label={member.name}
                  checked={false}
                  disabled
                />
              ) : null}
              <Table.Cell>
                <Entity.Root>
                  <Skeleton
                    show
                    shape='pill'
                  >
                    <Entity.Media>
                      <Avatar.Root
                        size='fit'
                        aria-hidden
                      >
                        <Avatar.Fallback />
                      </Avatar.Root>
                    </Entity.Media>
                  </Skeleton>
                  <Entity.Content>
                    <Entity.Label>
                      <Skeleton show>{member.name}</Skeleton>
                    </Entity.Label>
                    <Entity.Description>
                      <Skeleton show>{member.email}</Skeleton>
                    </Entity.Description>
                  </Entity.Content>
                </Entity.Root>
              </Table.Cell>
              <Table.Cell noWrap>
                <Skeleton show>{member.joinedAtLabel}</Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton show>{member.roleLabel}</Skeleton>
              </Table.Cell>
              {hasRemove ? (
                <Table.Cell align='end'>
                  <Skeleton
                    show
                    visible={false}
                  >
                    <ActionMenu
                      label={member.name}
                      disabled
                      actions={[{ label: m.remove, color: 'negative', onClick: () => undefined }]}
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
