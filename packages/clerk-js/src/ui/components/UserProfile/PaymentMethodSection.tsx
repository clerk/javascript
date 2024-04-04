import { useUser } from '@clerk/shared/react';
import type { BillingPlanResource } from '@clerk/types';

import { Flex, localizationKeys, Text, useLocalizations } from '../../customizables';
import { ProfileSection } from '../../elements';
import { mqu } from '../../styledSystem';

export const PaymentMethodSection = ({ currentPlan }: { currentPlan?: BillingPlanResource | null }) => {
  const { user } = useUser();
  const { t } = useLocalizations();

  const handleStartPortalSession = async () => {
    const res = await user?.createPortalSession({ returnUrl: window.location.href });
    window.location.href = res?.redirectUrl || '';
  };

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
          <Flex sx={{ flexDirection: 'column' }}>
            <Text>•••• {currentPlan.paymentMethod.card.last4}</Text>
            <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>
              {t(localizationKeys('billing.paymentMethodSection.expires'))} {currentPlan.paymentMethod.card.expMonth}/
              {currentPlan.paymentMethod.card.expYear}
            </Text>
          </Flex>
        ) : (
          <ProfileSection.ArrowButton
            id='paymentMethod'
            localizationKey={localizationKeys('billing.paymentMethodSection.primaryButton')}
            onClick={handleStartPortalSession}
          />
        )}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
