import { Panel } from '../../components/panel';
import { themeProps } from '../../props';
import { APIKeysTableSkeleton } from '../api-keys/api-keys-table.skeleton';

export function UserProfileApiKeysPanelSkeleton() {
  return (
    <Panel.Root render={<div {...themeProps('user-profile-api-keys-panel', { skeleton: true })} />}>
      <Panel.Title skeleton />
      <APIKeysTableSkeleton />
    </Panel.Root>
  );
}
