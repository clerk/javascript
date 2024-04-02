import { Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { mqu } from '../../styledSystem';

export const PaymentMethodSection = () => {
  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.paymentMethodSection.title')}
      id='currentPlan'
      centered={false}
      sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item id='currentPlan'>
        <Flex sx={{ flexDirection: 'column' }}>
          <Text>•••• 4242</Text>
          <Text sx={t => ({ color: t.colors.$colorTextSecondary, fontSize: t.fontSizes.$sm })}>Expires 03/2025</Text>
        </Flex>
      </ProfileSection.Item>
    </ProfileSection.Root>
  );
};
