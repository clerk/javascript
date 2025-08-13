import { useClerk } from '@clerk/shared/react';
import type { CommercePlanResource, CommerceSubscriptionPlanPeriod, PricingTableProps } from '@clerk/types';
import { useEffect, useMemo, useState } from 'react';

import { Flow } from '@/ui/customizables/Flow';

import { usePaymentMethods, usePlans, usePlansContext, usePricingTableContext, useSubscription } from '../../contexts';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTableRoot = (props: PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted', signInMode = 'redirect' } = usePricingTableContext();
  const isCompact = mode === 'modal';
  const { subscriptionItems } = useSubscription();
  const { data: plans } = usePlans();
  const { handleSelectPlan } = usePlansContext();

  const defaultPlanPeriod = useMemo(() => {
    if (isCompact) {
      const upcomingSubscription = subscriptionItems?.find(sub => sub.status === 'upcoming');
      if (upcomingSubscription) {
        return upcomingSubscription.planPeriod;
      }

      // don't pay attention to the default plan
      const activeSubscription = subscriptionItems?.find(
        sub => !sub.canceledAt && sub.status === 'active' && !sub.plan.isDefault,
      );
      if (activeSubscription) {
        return activeSubscription.planPeriod;
      }
    }

    return 'annual';
  }, [isCompact, subscriptionItems]);

  const [planPeriod, setPlanPeriod] = useState<CommerceSubscriptionPlanPeriod>(defaultPlanPeriod);

  useEffect(() => {
    setPlanPeriod(defaultPlanPeriod);
  }, [defaultPlanPeriod]);

  const selectPlan = (plan: CommercePlanResource, event?: React.MouseEvent<HTMLElement>) => {
    if (!clerk.isSignedIn) {
      if (signInMode === 'modal') {
        return clerk.openSignIn();
      }
      return clerk.redirectToSignIn();
    }

    handleSelectPlan({
      mode,
      plan,
      planPeriod,
      event,
      appearance: props.checkoutProps?.appearance,
      newSubscriptionRedirectUrl: props.newSubscriptionRedirectUrl,
    });
    return;
  };

  // Pre-fetch payment sources
  usePaymentMethods();

  return (
    <Flow.Root
      flow='pricingTable'
      sx={{
        width: '100%',
      }}
    >
      {mode !== 'modal' && (props as any).layout === 'matrix' ? (
        <PricingTableMatrix
          plans={plans}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          onSelect={selectPlan}
          highlightedPlan={(props as any).highlightPlan}
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
    </Flow.Root>
  );
};

// When used in a modal, we need to wrap the root in a div to avoid layout issues
// within UserProfile and OrganizationProfile.
const PricingTableModal = (props: PricingTableProps) => {
  return (
    // TODO: Used by InvisibleRootBox, can we simplify?
    <div>
      <PricingTableRoot {...props} />
    </div>
  );
};

export const PricingTable = (props: PricingTableProps) => {
  const { mode = 'mounted' } = usePricingTableContext();

  return mode === 'modal' ? <PricingTableModal {...props} /> : <PricingTableRoot {...props} />;
};
