import * as stylex from '@stylexjs/stylex';

import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useSkeletonWave } from '../../hooks/use-skeleton-wave';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { skeletonStyles } from '../../styles/skeleton.styles';
import { styles } from './api-keys-table.styles';
import type { APIKeysTableViewProps } from './api-keys-table.types';

export type APIKeysTableSkeletonProps = Pick<APIKeysTableViewProps, 'pageSize'>;

export function APIKeysTableSkeleton({ pageSize = 10 }: APIKeysTableSkeletonProps) {
  const m = useMessages('apiKeysTable');

  return (
    <div {...mergeStyleProps(themeProps('api-keys-table', { skeleton: true }), stylex.props(styles.root))}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Table.Toolbar aria-hidden>
        <Bone xstyle={styles.searchSkeleton} />
        <Bone xstyle={styles.createSkeleton} />
      </Table.Toolbar>
      <Table.Root skeleton>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell skeleton />
            <Table.HeaderCell skeleton />
            <Table.HeaderCell skeleton />
            <Table.HeaderCell xstyle={styles.actionsSkeleton} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from({ length: pageSize }, (_, row) => (
            <Table.Row key={row}>
              <Table.Cell>
                <Bone
                  line
                  xstyle={styles.nameSkeleton}
                />
                <Bone
                  line
                  xstyle={styles.metadataSkeleton}
                />
              </Table.Cell>
              <Table.Cell skeleton />
              <Table.Cell skeleton />
              <Table.Cell xstyle={styles.actionsSkeleton} />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

function Bone({ line = false, xstyle }: { line?: boolean; xstyle: stylex.StyleXStyles }) {
  const wave = useSkeletonWave<HTMLSpanElement>(true);

  return (
    <span
      ref={wave}
      {...stylex.props(skeletonStyles.bone, skeletonStyles.wave, line && skeletonStyles.line, xstyle)}
    />
  );
}
