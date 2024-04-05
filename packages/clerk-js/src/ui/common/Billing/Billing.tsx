import { BillingProvider, useBillingContext } from './BillingProvider';
import { ManagePlanScreen } from './ManageBillingPlanScreen';
import { PlanAndBillingScreen } from './PlanAndBillingScreen';

export const Billing = () => {
  const { currentPage } = useBillingContext();

  if (currentPage === 'planAndBilling') {
    return <PlanAndBillingScreen />;
  }

  if (currentPage === 'manageBillingPlan') {
    return <ManagePlanScreen />;
  }

  return <div />;
};

Billing.Root = BillingProvider;
