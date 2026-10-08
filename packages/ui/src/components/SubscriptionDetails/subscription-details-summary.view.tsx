import { LineItems } from '@/ui/elements/LineItems';

import { localizationKeys } from '../../customizables';
import type { SubscriptionDetailsSummaryData } from './subscription-details.types';

export const SubscriptionDetailsSummaryView = ({ controller }: { controller: SubscriptionDetailsSummaryData }) => (
  <LineItems.Root>
    <LineItems.Group>
      <LineItems.Title description={localizationKeys('billing.subscriptionDetails.currentBillingCycle')} />
      <LineItems.Description text={controller.billingCycle} />
    </LineItems.Group>
    <LineItems.Group>
      <LineItems.Title description={controller.paymentDateLabel} />
      <LineItems.Description text={controller.paymentDate} />
    </LineItems.Group>
    <LineItems.Group>
      <LineItems.Title description={controller.paymentAmountLabel} />
      <LineItems.Description
        prefix={controller.paymentCurrency}
        text={controller.paymentAmount}
      />
    </LineItems.Group>
  </LineItems.Root>
);
