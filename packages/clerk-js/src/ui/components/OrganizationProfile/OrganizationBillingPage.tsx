import { useOrganization } from '@clerk/shared/react';

import { Billing } from '../../common';
import { FullHeightLoader } from '../../elements';
import { useFetch } from '../../hooks';

export const OrganizationBillingPage = () => {
  const { organization } = useOrganization();
  const { data: availablePlans, isLoading: isLoadingAvailablePlans } = useFetch(
    organization?.getAvailablePlans,
    'availablePlans',
  );
  const { data: currentPlan, isLoading: isLoadingCurrentPlan } = useFetch(organization?.getCurrentPlan, 'currentPlan');

  if (isLoadingCurrentPlan || isLoadingAvailablePlans || !organization) {
    return <FullHeightLoader />;
  }

  if (!currentPlan) {
    return null;
  }

  return (
    <Billing.Root
      createPortalSession={organization?.createPortalSession}
      changePlan={organization?.changePlan}
      currentPlan={currentPlan}
      availablePlans={availablePlans?.data || []}
    >
      <Billing />
    </Billing.Root>
  );
};
