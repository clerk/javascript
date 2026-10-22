import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';

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
import { styles } from './requests-table-tab.styles';
import type { OrganizationProfileRequest } from './requests-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const PLACEHOLDER_REQUESTS: OrganizationProfileRequest[] = [
  {
    id: 'orgreq_placeholder_1',
    email: 'jordan.reyes@northwind.co',
    name: 'Jordan Reyes',
    requestedAtLabel: 'Mar 12, 2026',
  },
  {
    id: 'orgreq_placeholder_2',
    email: 'priya.nair@northwind.co',
    name: 'Priya Nair',
    requestedAtLabel: 'Apr 3, 2026',
  },
  {
    id: 'orgreq_placeholder_3',
    email: 'sam.whitfield@northwind.co',
    name: 'Sam Whitfield',
    requestedAtLabel: 'May 21, 2026',
  },
];

export function RequestsTableTabSkeleton({
  hasInvite,
  hasAccept,
  hasDecline,
  hasBulkAction,
}: {
  hasInvite: boolean;
  hasAccept: boolean;
  hasDecline: boolean;
  hasBulkAction: boolean;
}) {
  const m = useMessages('requestsTableTab');
  const hasActions = hasAccept || hasDecline;
  return (
    <div
      {...mergeStyleProps(themeProps('requests-table-tab'), stylex.props(tableTabStyles.root))}
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
        minWidth='33rem'
        aria-label={m.title}
        aria-busy
      >
        <Table.ColumnGroup>
          {hasBulkAction ? <Table.Column /> : null}
          <Table.Column />
          <Table.Column width='9rem' />
          {hasActions ? <Table.Column width='10rem' /> : null}
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
            <Table.HeaderCell>{m.requestedAt}</Table.HeaderCell>
            {hasActions ? (
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
          {PLACEHOLDER_REQUESTS.map(request => (
            <Table.Row key={request.id}>
              {hasBulkAction ? (
                <Table.SelectCell
                  aria-label={request.email}
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
                      <Skeleton show>{request.name}</Skeleton>
                    </Entity.Label>
                    <Entity.Description>
                      <Skeleton show>{request.email}</Skeleton>
                    </Entity.Description>
                  </Entity.Content>
                </Entity.Root>
              </Table.Cell>
              <Table.Cell noWrap>
                <Skeleton show>{request.requestedAtLabel}</Skeleton>
              </Table.Cell>
              {hasActions ? (
                <Table.Cell align='end'>
                  <Skeleton
                    show
                    visible={false}
                  >
                    <div {...stylex.props(styles.actions)}>
                      {hasDecline ? (
                        <Button
                          size='sm'
                          variant='outline'
                          color='neutral'
                          disabled
                        >
                          {m.decline}
                        </Button>
                      ) : null}
                      {hasAccept ? (
                        <Button
                          size='sm'
                          disabled
                        >
                          {m.accept}
                        </Button>
                      ) : null}
                    </div>
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
