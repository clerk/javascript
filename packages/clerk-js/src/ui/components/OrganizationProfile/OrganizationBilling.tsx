import { useOrganization } from '@clerk/shared/react';

import { ChangePlanButton, ManagePlanScreen, OrganizationPlanCard } from '../../common/Billing';
import { Box, descriptors, Spinner } from '../../customizables';
import { useFetch } from '../../hooks';

export const OrganizationBilling = () => {
  const { organization } = useOrganization();
  const { data: availablePlans, isLoading: isLoadingAvailablePlans } = useFetch(
    organization?.getAvailablePlans,
    'availablePlans',
  );
  const { data: currentPlan, isLoading: isLoadingCurrentPlan } = useFetch(organization?.getCurrentPlan, 'currentPlan');

  if (isLoadingAvailablePlans || isLoadingCurrentPlan) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            margin: 'auto',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
          }}
        >
          <Spinner
            size='sm'
            colorScheme='primary'
            elementDescriptor={descriptors.spinner}
          />
        </Box>
      </Box>
    );
  }

  const handleChangePlan = async (planKey: string) => {
    try {
      const response = await organization?.changePlan({ planKey });
      //TODO Handle action after success response
      console.log(response);
    } catch (e) {
      //TODO Show error message if exists
      console.log(e);
    }
  };

  const plans = availablePlans?.data.map(({ name, id, features, priceInCents, key }) => {
    return (
      <OrganizationPlanCard
        isCurrentPlan={currentPlan?.key === key}
        planKey={key}
        key={id}
        name={name}
        features={features}
        priceInCents={priceInCents / 100}
        changePlanAction={<ChangePlanButton action={() => handleChangePlan(key)} />}
      />
    );
  });

  return <ManagePlanScreen plans={plans} />;
};
