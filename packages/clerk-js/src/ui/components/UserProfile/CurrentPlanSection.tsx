import { useUser } from '@clerk/shared/react';

import { Box, localizationKeys, Text, useLocalizations } from '../../customizables';
import { FullHeightLoader, ProfileSection } from '../../elements';
import { useFetch } from '../../hooks';
import { mqu } from '../../styledSystem';
import { centsToUnit, getRelativeToNowDateKey } from '../../utils';

export const CurrentPlanSection = () => {
  const { user } = useUser();
  const { t } = useLocalizations();
  const { data: currentPlan, isLoading } = useFetch(user?.getCurrentPlan, 'user-current-plan');

  if (!user) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.currentPlanSection.title')}
      id='currentPlan'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      {isLoading || !currentPlan ? (
        <FullHeightLoader />
      ) : (
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
              Renews on {t(getRelativeToNowDateKey(currentPlan.billingCycle.endDate))}
            </Text>
          </Box>
          <ProfileSection.Button
            id='currentPlan'
            localizationKey={localizationKeys('userProfile.start.currentPlanSection.primaryButton')}
          />
        </ProfileSection.Item>
      )}
    </ProfileSection.Root>
  );
};
