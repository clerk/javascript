import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { usePlansContext, usePricingTableContext } from '../../contexts';
import { useFetch } from '../../hooks/useFetch';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted', subscriberType } = usePricingTableContext();
  const isCompact = mode === 'modal';
  const { organization } = useOrganization();

  const { plans, handleSelectPlan } = usePlansContext();

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }

    handleSelectPlan({ mode, plan, planPeriod });
  };

  const { __experimental_commerce } = useClerk();

  const { user } = useUser();
  useFetch(
    user ? __experimental_commerce?.getPaymentSources : undefined,
    {
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-payment-sources-${user?.id}`,
  );

  return (
    <>
      {mode !== 'modal' && (props as any).layout === 'matrix' ? (
        <PricingTableMatrix
          plans={plans || []}
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
    </>
  );
};

export const __experimental_PricingTable = PricingTable;
