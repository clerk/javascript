import { useCreditBalance, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { useRouter } from '../../router';
import type { AccountCreditsModel } from './account-credits.types';

export function useAccountCreditsModel(): AccountCreditsModel {
  const { data: creditBalance, isLoading } = useCreditBalance({ keepPreviousData: false });
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { navigate } = useRouter();

  if (!creditBalance?.balance || isLoading) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    balance: {
      amount: creditBalance.balance.amount,
      amountFormatted: creditBalance.balance.amountFormatted,
      currency: creditBalance.balance.currency,
      currencySymbol: creditBalance.balance.currencySymbol,
    },
    localizationRoot,
    onViewHistory: () => void navigate('credit-history'),
  };
}
