import { useCreditBalance } from '@/contexts';
import { useRouter } from '@/router';

import { formatMoney } from './billing-format';

type OrganizationBillingAccountCreditsSectionController =
  | { status: 'hidden' }
  | {
      status: 'ready';
      /** Section heading. */
      title: string;
      /** Formatted credit balance, e.g. `"$50.00"`. */
      balanceLabel: string;
      /** View-credit-history action. */
      viewHistory: { label: string };
      /** Navigates to the credit-history screen. */
      onViewHistory: () => void;
    };

export function useOrganizationBillingAccountCreditsSectionController(): OrganizationBillingAccountCreditsSectionController {
  const { data, isLoading } = useCreditBalance();
  const { navigate } = useRouter();

  const balance = data?.balance;
  // Mirror the legacy section: render nothing until a non-null balance is known (no skeleton).
  if (isLoading || !balance) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    title: 'Account credits',
    balanceLabel: formatMoney(balance),
    viewHistory: { label: 'View credit history' },
    onViewHistory: () => void navigate('credit-history'),
  };
}
