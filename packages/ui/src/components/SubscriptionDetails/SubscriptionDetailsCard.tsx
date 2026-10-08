import { useSubscriptionDetailsCardModel } from './subscription-details-card.model';
import { SubscriptionDetailsCardView } from './subscription-details-card.view';
import { SubscriptionDetailsActions } from './SubscriptionDetailsActions';

export const SubscriptionDetailsCard = ({ subscriptionId }: { subscriptionId: string }) => {
  const model = useSubscriptionDetailsCardModel(subscriptionId);
  if (!model) {
    return null;
  }

  return (
    <SubscriptionDetailsCardView
      controller={model}
      actions={<SubscriptionDetailsActions subscriptionId={subscriptionId} />}
    />
  );
};
