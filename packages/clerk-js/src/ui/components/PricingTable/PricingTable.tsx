import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { CommercePlanResource, CommerceSubscriptionPlanPeriod, PricingTableProps } from '@clerk/types';
import { useState } from 'react';

import { usePlansContext, usePricingTableContext, useSubscriberTypeContext } from '../../contexts';
import { Flow } from '../../customizables';
import { useFetch } from '../../hooks/useFetch';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTableRoot = (props: PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const subscriberType = useSubscriberTypeContext();
  const isCompact = mode === 'modal';
  const { organization } = useOrganization();
  const { user } = useUser();

  const resource = subscriberType === 'org' ? organization : user;

  const { plans, handleSelectPlan } = usePlansContext();

  const [planPeriod, setPlanPeriod] = useState<CommerceSubscriptionPlanPeriod>('annual');

  const selectPlan = (plan: CommercePlanResource, event?: React.MouseEvent<HTMLElement>) => {
    if (!clerk.isSignedIn) {
      return clerk.redirectToSignIn();
    }

    handleSelectPlan({ mode, plan, planPeriod, event });
  };

  useFetch(resource?.getPaymentSources, {}, undefined, `commerce-payment-sources-${resource?.id}`);

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
