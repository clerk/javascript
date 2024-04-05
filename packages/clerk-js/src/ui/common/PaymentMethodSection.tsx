import type { CurrentBillingPlanResource } from '@clerk/types';

import { Box, localizationKeys, Text, useLocalizations } from '../customizables';
import { ProfileSection } from '../elements';
import { mqu } from '../styledSystem';

type PaymentMethodSectionProps = {
  currentPlan?: CurrentBillingPlanResource | null;
  isLoadingPortalSession: boolean;
  onClickManageBilling: () => void;
};

export const PaymentMethodSection = ({
  currentPlan,
  isLoadingPortalSession,
  onClickManageBilling,
}: PaymentMethodSectionProps) => {
  const { t } = useLocalizations();

  if (!currentPlan) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('billing.paymentMethodSection.title')}
      id='paymentMethod'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='paymentMethod'>
        {currentPlan.paymentMethod ? (
          <>
            <Box>
              <Text>•••• {currentPlan.paymentMethod.card.last4}</Text>
              <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>
                {t(localizationKeys('billing.paymentMethodSection.expires'))} {currentPlan.paymentMethod.card.expMonth}/
                {currentPlan.paymentMethod.card.expYear}
              </Text>
            </Box>
            <ProfileSection.Button
              id='paymentMethod'
              localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton__manageBillingInfo')}
              onClick={onClickManageBilling}
              isLoading={isLoadingPortalSession}
            />
          </>
        ) : (
          <ProfileSection.ArrowButton
            id='paymentMethod'
            localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton')}
          />
        )}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
