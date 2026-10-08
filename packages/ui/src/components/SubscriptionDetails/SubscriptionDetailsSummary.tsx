import { useSubscriptionDetailsSummaryModel } from './subscription-details-summary.model';
import { SubscriptionDetailsSummaryView } from './subscription-details-summary.view';

export const SubscriptionDetailsSummary = () => {
  const model = useSubscriptionDetailsSummaryModel();
  return model ? <SubscriptionDetailsSummaryView controller={model} /> : null;
};
