import { ProfileSection } from '@/ui/elements/Section';
import { useCreditBalance, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';

export const AccountCredits = () => {
  const { data: creditBalance, isLoading } = useCreditBalance();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  // Only show if balance is not null
  if (!creditBalance?.balance || isLoading) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys(`${localizationRoot}.billingPage.accountCreditsSection.title`)}
      centered={false}
      id='accountCredits'
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
      })}
    >
      <ProfileSection.ItemList
        id='accountCredits'
        disableAnimation
      >
        <ProfileSection.Item id='accountCredits'>
          <Text variant='subtitle'>
            {creditBalance.balance.currencySymbol}
            {creditBalance.balance.amountFormatted}
          </Text>
        </ProfileSection.Item>
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};
