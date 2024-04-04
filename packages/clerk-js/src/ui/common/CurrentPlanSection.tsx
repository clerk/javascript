import type { BillingPlanResource } from '@clerk/types';

import { Box, localizationKeys, Text, useLocalizations } from '../customizables';
import { ProfileSection } from '../elements';
import { mqu } from '../styledSystem';
import { centsToUnit, getRelativeToNowDateKey } from '../utils';

export const CurrentPlanSection = ({ currentPlan }: { currentPlan?: BillingPlanResource | null }) => {
  const { t } = useLocalizations();

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
            {centsToUnit(currentPlan.priceInCents)}{' '}
            <Text
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$md })}
            >
              per month
            </Text>
          </Text>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            Renews on {t(getRelativeToNowDateKey(currentPlan.billingCycle?.endDate))}
          </Text>
        </Box>
        <ProfileSection.Button
          id='currentPlan'
          localizationKey={localizationKeys('billing.currentPlanSection.primaryButton')}
        />
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
