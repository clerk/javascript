import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { usePricingTableContext } from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { usePlans } from '../../hooks';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';
import { SubscriptionDetailDrawer } from './SubscriptionDetailDrawer';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  // const { organization } = useOrganization();
  const { mode = 'mounted', subscriberType = 'user' } = usePricingTableContext();
  const isCompact = mode === 'modal';

  const { plans, subscriptions, revalidate } = usePlans({ subscriberType });

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');
  const [detailSubscription, setDetailSubscription] = useState<__experimental_CommerceSubscriptionResource>();

  const [showSubscriptionDetailDrawer, setShowSubscriptionDetailDrawer] = useState(false);

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }
    const activeSubscription = subscriptions.find(sub => sub.id === plan.subscriptionIdForCurrentSubscriber);
    if (activeSubscription) {
      setDetailSubscription(activeSubscription);
      setShowSubscriptionDetailDrawer(true);
    } else {
      clerk.__internal_openCheckout({
        planId: plan.id,
        planPeriod,
        portalId: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
        // orgId: subscriberType === 'org' ? organization?.id : undefined,
        // onSubscriptionComplete: onSubscriptionChange
      });
    }
  };

  const onSubscriptionChange = () => {
    void revalidate();
  };

  return (
    <>
      {mode !== 'modal' && props.layout === 'matrix' ? (
        <PricingTableMatrix
          plans={plans || []}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          onSelect={selectPlan}
          highlightedPlan={props.highlightPlan}
        />
      ) : (
        <PricingTableDefault
          plans={plans}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          onSelect={selectPlan}
          isCompact={isCompact}
          props={props}
        />
      )}

      <AppearanceProvider
        appearanceKey='checkout'
        appearance={props.checkoutProps?.appearance}
      >
        <SubscriptionDetailDrawer
          isOpen={showSubscriptionDetailDrawer}
          setIsOpen={setShowSubscriptionDetailDrawer}
          subscription={detailSubscription}
          setPlanPeriod={setPlanPeriod}
          strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
          portalProps={{
            id: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
          }}
          onSubscriptionCancel={onSubscriptionChange}
        />
      </AppearanceProvider>
    </>
  );
};
