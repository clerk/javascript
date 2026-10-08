import { withCardStateProvider } from '@/ui/elements/contexts';

import { SubscriberTypeContext } from '../../contexts';
import { useBillingPageController } from '../BillingPage/billing-page.controller';
import { BillingPageView } from '../BillingPage/billing-page.view';

const BillingPageInternal = withCardStateProvider(() => {
  const controller = useBillingPageController('user');
  return <BillingPageView {...controller} />;
});

export const BillingPage = () => {
  return (
    <SubscriberTypeContext.Provider value='user'>
      <BillingPageInternal />
    </SubscriberTypeContext.Provider>
  );
};
