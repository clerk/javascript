import { useSubscriptionsListModel } from './subscriptions-list.model';
import type { SubscriptionsListProps } from './subscriptions-list.types';
import { SubscriptionsListView } from './subscriptions-list.view';

export function SubscriptionsList({
  title,
  switchPlansLabel,
  newSubscriptionLabel,
  manageSubscriptionLabel,
}: SubscriptionsListProps) {
  const model = useSubscriptionsListModel();
  return (
    <SubscriptionsListView
      data={model}
      title={title}
      switchPlansLabel={switchPlansLabel}
      newSubscriptionLabel={newSubscriptionLabel}
      manageSubscriptionLabel={manageSubscriptionLabel}
    />
  );
}
