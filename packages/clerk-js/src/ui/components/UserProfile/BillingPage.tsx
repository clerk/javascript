import { useUser } from '@clerk/shared/react';

import { Billing } from '../../common';
import { useEnvironment } from '../../contexts';
import { FullHeightLoader, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';

export const BillingPage = withCardStateProvider(() => {
  const { user } = useUser();
  const { data: currentPlan, isLoading: isLoadingCurrentPlan } = useFetch(user?.getCurrentPlan, 'user-current-plan');
  const { data: availablePlans, isLoading: isLoadingAvailablePlans } = useFetch(
    user?.getAvailablePlans,
    'user-available-plans',
  );
  const { userSettings } = useEnvironment();

  if (isLoadingCurrentPlan || isLoadingAvailablePlans || !user) {
    return <FullHeightLoader />;
  }

  if (!currentPlan) {
    return null;
  }

  return (
    <Billing.Root
      createPortalSession={user?.createPortalSession}
      changePlan={user?.changePlan}
      currentPlan={currentPlan}
      availablePlans={availablePlans?.data || []}
      portalEnabled={userSettings?.billing.portal_enabled}
    >
      <Billing />
    </Billing.Root>
  );
});
