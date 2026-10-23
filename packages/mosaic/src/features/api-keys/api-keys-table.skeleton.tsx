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
import { APIKeysTableColumns } from './api-keys-table.view';

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
        <APIKeysTableColumns
          selectable={false}
          revocable={canManage}
        />
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{m.name}</Table.HeaderCell>
            <Table.HeaderCell>{m.createdAt}</Table.HeaderCell>
            <Table.HeaderCell>{m.lastUsed}</Table.HeaderCell>
            {canManage ? (
              <Table.HeaderCell align='end'>
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.HeaderCell>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body aria-hidden>
          {PLACEHOLDER_API_KEYS.map(apiKey => (
            <Table.Row key={apiKey.id}>
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
          ))}
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
