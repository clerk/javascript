import { useCallback } from 'react';

import { usePaymentAttempts } from './Plans';

export const usePaymentAttemptsContext = () => {
  const { data: payments } = usePaymentAttempts();
  const getPaymentAttemptById = useCallback(
    (paymentAttemptId: string) => {
      return payments.find(payment => payment.id === paymentAttemptId);
    },
    [payments],
  );

  return {
    getPaymentAttemptById,
  };
};
