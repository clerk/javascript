import { useCreditHistory, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { useRouter } from '../../router';
import type { CreditHistoryViewProps } from './account-credits.types';

export function useCreditHistoryModel(): CreditHistoryViewProps {
  const { data: creditHistory, isLoading } = useCreditHistory();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { navigate } = useRouter();

  return {
    status: isLoading ? 'loading' : 'ready',
    localizationRoot,
    entries: (creditHistory?.data ?? []).map(entry => ({
      id: entry.id,
      amount: {
        amount: entry.amount.amount,
        amountFormatted: entry.amount.amountFormatted,
        currency: entry.amount.currency,
        currencySymbol: entry.amount.currencySymbol,
      },
      createdAt: entry.createdAt.getTime(),
    })),
    onBack: () => void navigate('../'),
  };
}
