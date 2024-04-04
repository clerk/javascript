import type { BillingPlanResource } from '@clerk/types';

import { Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { mqu } from '../../styledSystem';

export const PaymentMethodSection = ({ currentPlan }: { currentPlan?: BillingPlanResource | null }) => {
  if (!currentPlan) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.paymentMethodSection.title')}
      id='currentPlan'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='currentPlan'>
        {currentPlan.paymentMethod ? (
          <Flex sx={{ flexDirection: 'column' }}>
            <Text>•••• {currentPlan.paymentMethod.card.last4}</Text>
            <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>
              Expires {currentPlan.paymentMethod.card.expMonth}/{currentPlan.paymentMethod.card.expYear}
            </Text>
          </Flex>
        ) : (
          <Text>Add payment method</Text>
        )}
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
