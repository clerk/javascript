import { RequestsTableTabSkeleton } from './requests-table-tab.skeleton';
import type { RequestsTableTabViewProps } from './requests-table-tab.types';
import { RequestsTableTabView } from './requests-table-tab.view';

export function RequestsTableTab(props: RequestsTableTabViewProps) {
  if (props.isLoading || (props.isFetching && props.requests.length === 0)) {
    return (
      <RequestsTableTabSkeleton
        hasInvite={Boolean(props.onInvite)}
        hasAccept={Boolean(props.onAccept)}
        hasDecline={Boolean(props.onDecline)}
        hasBulkAction={Boolean(props.onBulkAction)}
      />
    );
  }
  return <RequestsTableTabView {...props} />;
}
