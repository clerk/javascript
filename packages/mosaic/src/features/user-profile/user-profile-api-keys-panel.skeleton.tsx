import { Panel } from '../../components/panel';
import { Skeleton } from '../../components/skeleton';
import { useMessages } from '../../localization';
import { themeProps } from '../../props';
import { APIKeysTableSkeleton } from '../api-keys/api-keys-table.skeleton';

export function UserProfileApiKeysPanelSkeleton() {
  const m = useMessages('userProfile');

  return (
    <Panel.Root render={<div {...themeProps('user-profile-api-keys-panel', { skeleton: true })} />}>
      <Panel.Title>
        <Skeleton>{m.pages.apiKeys}</Skeleton>
      </Panel.Title>
      <APIKeysTableSkeleton />
    </Panel.Root>
  );
}
