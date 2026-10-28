import * as stylex from '@stylexjs/stylex';

import { Button } from '../../components/button';
import { Menu } from '../../components/menu';
import { Skeleton } from '../../components/skeleton';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './api-keys-table.styles';
import type { APIKeysTableMessages } from './api-keys-table.types';

export function APIKeysTableSkeleton({
  messages: m,
  canManage,
}: {
  messages: APIKeysTableMessages;
  canManage: boolean;
}) {
  return (
    <div {...mergeStyleProps(themeProps('api-keys-table'), stylex.props(styles.root))}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Table.Toolbar>
        <Table.Search
          label={m.search}
          clearLabel={m.clearSearch}
          value=''
          onValueChange={() => undefined}
          disabled
        />
        {canManage ? <Button disabled>{m.create}</Button> : null}
      </Table.Toolbar>
      <Table.Root
        aria-label={m.title}
        aria-busy
        layout='fixed'
        minWidth='36rem'
      >
        <Table.Header>
          <Table.Column>{m.name}</Table.Column>
          <Table.Column width='9rem'>{m.createdAt}</Table.Column>
          <Table.Column width='9rem'>{m.lastUsed}</Table.Column>
          {canManage ? (
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
          items={PLACEHOLDER_API_KEYS}
          itemToStringValue={apiKey => apiKey.id}
        >
          {apiKey => (
            <Table.Row>
              <Table.Cell>
                <div {...stylex.props(styles.metadata)}>
                  <Text xstyle={styles.name}>
                    <Skeleton>{apiKey.name}</Skeleton>
                  </Text>
                  <Text size='xs'>
                    <Skeleton>{apiKey.details}</Skeleton>
                  </Text>
                </div>
              </Table.Cell>
              <Table.Cell noWrap>
                <Text>
                  <Skeleton>{apiKey.created}</Skeleton>
                </Text>
              </Table.Cell>
              <Table.Cell noWrap>
                <Text>
                  <Skeleton>{apiKey.lastUsed}</Skeleton>
                </Text>
              </Table.Cell>
              {canManage ? (
                <Table.Cell align='end'>
                  <Skeleton visible={false}>
                    <Menu.Root>
                      <Menu.Trigger
                        aria-label={m.actions}
                        disabled
                      />
                    </Menu.Root>
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

const PLACEHOLDER_API_KEYS = [
  {
    id: 'production',
    name: 'Production',
    details: 'ak_placeh…0001 · Expires Mar 12, 2027',
    created: 'Mar 12, 2026',
    lastUsed: '5 minutes ago',
  },
  {
    id: 'deploy',
    name: 'Deploy script',
    details: 'ak_placeh…0002 · Never expires',
    created: 'Mar 18, 2026',
    lastUsed: 'Never',
  },
  {
    id: 'reporting',
    name: 'Reporting',
    details: 'ak_placeh…0003 · Never expires',
    created: 'Apr 2, 2026',
    lastUsed: '3 hours ago',
  },
];
