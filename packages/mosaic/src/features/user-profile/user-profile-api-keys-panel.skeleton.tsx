import * as stylex from '@stylexjs/stylex';

import { Panel } from '../../components/panel';
import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useSkeletonWave } from '../../hooks/useSkeletonWave';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import { skeletonStyles } from '../../utils/skeleton.styles';
import { styles } from './user-profile-api-keys-panel.styles';

const SKELETON_ROWS = [0, 1, 2];

export function UserProfileApiKeysPanelSkeleton() {
  const m = useMessages('userProfileApiKeysPanel');

  return (
    <Panel.Root render={<div {...themeProps('user-profile-api-keys-panel', { skeleton: true })} />}>
      <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
      <Panel.Title skeleton />
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
          {SKELETON_ROWS.map(row => (
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
    </Panel.Root>
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
