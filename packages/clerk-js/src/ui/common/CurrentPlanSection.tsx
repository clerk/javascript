import type { BillingPlanResource } from '@clerk/types';

import { Box, localizationKeys, Text, useLocalizations } from '../customizables';
import { ProfileSection } from '../elements';
import { mqu } from '../styledSystem';
import { centsToUnit, getRelativeToNowDateKey } from '../utils';
import { useBillingContext } from './Billing';

export const CurrentPlanSection = ({ currentPlan }: { currentPlan?: BillingPlanResource | null }) => {
  const { t, locale } = useLocalizations();
  const { goToManageBillingPlan } = useBillingContext();

  if (!currentPlan) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('billing.currentPlanSection.title')}
      id='currentPlan'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='currentPlan'>
        <Box>
          <Text
            variant='subtitle'
            sx={t => ({ marginBottom: t.space.$2 })}
          >
            {currentPlan.name}
          </Text>
          <Text sx={t => ({ fontWeight: t.fontWeights.$semibold, fontSize: t.fontSizes.$lg })}>
            {centsToUnit({ cents: currentPlan.priceInCents, locale })}{' '}
            <Text
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$md })}
            >
              {t(localizationKeys('billing.currentPlanSection.perMonth'))}
            </Text>
          </Text>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {t(localizationKeys('billing.currentPlanSection.renewsOn'))}{' '}
            {t(getRelativeToNowDateKey(currentPlan.billingCycle?.endDate))}
          </Text>
        </Box>
        <ProfileSection.Button
          onClick={goToManageBillingPlan}
          id='currentPlan'
          localizationKey={localizationKeys('billing.currentPlanSection.primaryButton')}
        />
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
