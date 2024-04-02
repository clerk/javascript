import { localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { mqu } from '../../styledSystem';

export const CurrentPlanSection = () => {
  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.currentPlanSection.title')}
      id='currentPlan'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='currentPlan'>
        <div>
          <Text
            variant='subtitle'
            sx={t => ({ marginBottom: t.space.$2 })}
          >
            Business
          </Text>
          <Text sx={t => ({ fontWeight: t.fontWeights.$semibold, fontSize: t.fontSizes.$lg })}>
            $200.00{' '}
            <Text
              as='span'
              sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$md })}
            >
              per month
            </Text>
          </Text>
          <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>
            Renews on 28 April 2024
          </Text>
        </div>
        <ProfileSection.Button
          id='currentPlan'
          localizationKey={localizationKeys('userProfile.start.currentPlanSection.primaryButton')}
        />
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
