import { withCardStateProvider } from '@/ui/elements/contexts';

import { SubscriberTypeContext } from '../../contexts';
import { useBillingPageController } from '../BillingPage/billing-page.controller';
import { BillingPageView } from '../BillingPage/billing-page.view';

const OrganizationBillingPageInternal = withCardStateProvider(() => {
  const controller = useBillingPageController('organization');
  return <BillingPageView {...controller} />;
});

export const OrganizationBillingPage = () => {
  return (
    <SubscriberTypeContext.Provider value='organization'>
      <OrganizationBillingPageInternal />
    </SubscriberTypeContext.Provider>
  );
};
