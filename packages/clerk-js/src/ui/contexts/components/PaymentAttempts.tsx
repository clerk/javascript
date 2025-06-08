import { useCallback } from 'react';

import { usePaymentAttempts } from './Plans';

export const usePaymentAttemptsContext = () => {
  const { data: payments } = usePaymentAttempts();
  const getPaymentAttemptById = useCallback(
    (paymentAttemptId: string) => {
      return payments?.data.find(payment => payment.id === paymentAttemptId);
    },
    [payments?.data],
  );

  return {
    getPaymentAttemptById,
  };
};
