import { Panel } from '../../components/panel';
import { themeProps } from '../../props';
import type { APIKeysTableSkeletonProps } from '../api-keys/api-keys-table.skeleton';
import { APIKeysTableSkeleton } from '../api-keys/api-keys-table.skeleton';

export function UserProfileApiKeysPanelSkeleton({ pageSize }: APIKeysTableSkeletonProps) {
  return (
    <Panel.Root render={<div {...themeProps('user-profile-api-keys-panel', { skeleton: true })} />}>
      <Panel.Title skeleton />
      <APIKeysTableSkeleton pageSize={pageSize} />
    </Panel.Root>
  );
}
