import { MembersTableTabSkeleton } from './members-table-tab.skeleton';
import type { MembersTableTabViewProps } from './members-table-tab.types';
import { MembersTableTabView } from './members-table-tab.view';

export function MembersTableTab(props: MembersTableTabViewProps) {
  if (props.isLoading) {
    return (
      <MembersTableTabSkeleton
        hasInvite={Boolean(props.onInvite)}
        hasRemove={Boolean(props.remove)}
        hasBulkAction={Boolean(props.onBulkAction)}
      />
    );
  }
  return <MembersTableTabView {...props} />;
}
