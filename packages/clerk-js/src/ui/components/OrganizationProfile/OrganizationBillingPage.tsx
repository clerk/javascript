import { useOrganization } from '@clerk/shared/react';

import { Billing } from '../../common';
import { FullHeightLoader, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';

export const OrganizationBillingPage = withCardStateProvider(() => {
  const { organization } = useOrganization();
  const { data: availablePlans, isLoading: isLoadingAvailablePlans } = useFetch(
    organization?.getAvailablePlans,
    'organization-available-plans',
  );
  const { data: currentPlan, isLoading: isLoadingCurrentPlan } = useFetch(
    organization?.getCurrentPlan,
    'organization-currentPlan',
  );

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
});
