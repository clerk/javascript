import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { usePlansContext, usePricingTableContext } from '../../contexts';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted', subscriberType } = usePricingTableContext();
  const isCompact = mode === 'modal';

  const { plans, revalidate, activeOrUpcomingSubscription } = usePlansContext();

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }

    const subscription = activeOrUpcomingSubscription(plan);

    if (subscription && !subscription.canceledAt) {
      clerk.__internal_openSubscriptionDetailDrawer({
        subscription,
        subscriberType,
        onSubscriptionCancel: onSubscriptionChange,
        portalId: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
      });
    } else {
      clerk.__internal_openCheckout({
        planId: plan.id,
        planPeriod,
        subscriberType,
        onSubscriptionComplete: onSubscriptionChange,
        portalId: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
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
    </>
  );
};

export const __experimental_PricingTable = PricingTable;
