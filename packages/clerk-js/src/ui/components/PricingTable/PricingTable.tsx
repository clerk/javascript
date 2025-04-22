import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { usePlansContext, usePricingTableContext } from '../../contexts';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const isCompact = mode === 'modal';

  const { plans, handleSelectPlan } = usePlansContext();

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }

    handleSelectPlan({ mode, plan, planPeriod });
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
