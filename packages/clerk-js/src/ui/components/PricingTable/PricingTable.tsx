import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID, USER_PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { usePlansContext, usePricingTableContext } from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';
import { SubscriptionDetailDrawer } from './SubscriptionDetailDrawer';

const PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted', subscriberType } = usePricingTableContext();
  const isCompact = mode === 'modal';

  const { plans, revalidate, activeOrUpcomingSubscription } = usePlansContext();

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');
  const [detailSubscription, setDetailSubscription] = useState<__experimental_CommerceSubscriptionResource>();

  const [showSubscriptionDetailDrawer, setShowSubscriptionDetailDrawer] = useState(false);

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }

    const subscription = activeOrUpcomingSubscription(plan);

    if (subscription && !subscription.canceledAt) {
      setDetailSubscription(subscription);
      setShowSubscriptionDetailDrawer(true);
    } else {
      clerk.__internal_openCheckout({
        planId: plan.id,
        planPeriod,
        subscriberType,
        onSubscriptionComplete: onSubscriptionChange,
        portalId:
          mode === 'modal'
            ? subscriberType === 'user'
              ? USER_PROFILE_CARD_SCROLLBOX_ID
              : ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID
            : undefined,
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
          subscriberType={subscriberType}
          setPlanPeriod={setPlanPeriod}
          strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
          portalProps={{
            id:
              mode === 'modal'
                ? subscriberType === 'user'
                  ? USER_PROFILE_CARD_SCROLLBOX_ID
                  : ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID
                : undefined,
          }}
          onSubscriptionCancel={onSubscriptionChange}
        />
      </AppearanceProvider>
    </>
  );
};

export const __experimental_PricingTable = PricingTable;
