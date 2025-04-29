import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { usePlansContext, usePricingTableContext, useSubscriberTypeContext } from '../../contexts';
import { Flow } from '../../customizables';
import { useFetch } from '../../hooks/useFetch';
import { FreePlanRow } from './FreePlanRow';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

const PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const subscriberType = useSubscriberTypeContext();
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
      {/*TODO: Used by InvisibleRootBox, can we simplify? */}
      <div>
        <Flow.Root
          flow='pricingTable'
          sx={{
            width: '100%',
          }}
        >
          <FreePlanRow />
          {mode !== 'modal' && (props as any).layout === 'matrix' ? (
            <PricingTableMatrix
              plans={plans.filter(plan => !plan.isDefault)}
              planPeriod={planPeriod}
              setPlanPeriod={setPlanPeriod}
              onSelect={selectPlan}
              highlightedPlan={(props as any).highlightPlan}
            />
          ) : (
            <PricingTableDefault
              plans={plans.filter(plan => !plan.isDefault)}
              planPeriod={planPeriod}
              setPlanPeriod={setPlanPeriod}
              onSelect={selectPlan}
              isCompact={isCompact}
              props={props}
            />
          )}
        </Flow.Root>
      </div>
    </>
  );
};

export const __experimental_PricingTable = PricingTable;
