import { ProfileSection } from '@/ui/elements/Section';
import { useCreditBalance, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ArrowRight } from '../../icons';
import { useRouter } from '../../router';

export const AccountCredits = () => {
  const { data: creditBalance, isLoading } = useCreditBalance();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { navigate } = useRouter();

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
        <ProfileSection.ArrowButton
          id='accountCredits'
          textLocalizationKey={localizationKeys(`${localizationRoot}.billingPage.accountCreditsSection.viewHistory`)}
          sx={[t => ({ justifyContent: 'start', height: t.sizes.$8 })]}
          leftIconSx={() => ({ display: 'none' })}
          rightIcon={ArrowRight}
          rightIconSx={t => ({
            width: t.sizes.$4,
            height: t.sizes.$4,
          })}
          onClick={() => void navigate('credit-history')}
        />
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};
