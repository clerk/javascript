import { usePaymentAttempts, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import { formatDate } from '../../utils/formatDate';
import type { PaymentAttemptsListData } from './payment-attempt.types';

export const usePaymentAttemptsListModel = (): PaymentAttemptsListData => {
  const { data: paymentAttempts, isLoading, count } = usePaymentAttempts();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { $ } = useLocalizations();
  const { navigate } = useRouter();

  return {
    isLoading,
    count,
    localizationRoot,
    rows: paymentAttempts.map(paymentAttempt => {
      const id = paymentAttempt.id;
      return {
        id,
        date: formatDate(paymentAttempt.paidAt || paymentAttempt.failedAt || paymentAttempt.updatedAt, 'long'),
        amount: $(paymentAttempt.amount),
        status: paymentAttempt.status,
        onClick: () => void navigate(`payment-attempt/${id}`),
      };
    }),
  };
};
