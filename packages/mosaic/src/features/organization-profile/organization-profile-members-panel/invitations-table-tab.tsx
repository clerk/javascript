import { InvitationsTableTabSkeleton } from './invitations-table-tab.skeleton';
import type { InvitationsTableTabViewProps } from './invitations-table-tab.types';
import { InvitationsTableTabView } from './invitations-table-tab.view';

export function InvitationsTableTab(props: InvitationsTableTabViewProps) {
  if (props.isLoading) {
    return (
      <InvitationsTableTabSkeleton
        hasInvite={Boolean(props.onInvite)}
        hasRevoke={Boolean(props.revoke)}
        hasBulkAction={Boolean(props.onBulkAction)}
      />
    );
  }
  return <InvitationsTableTabView {...props} />;
}
