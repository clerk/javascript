import { usePaymentAttemptModel } from './payment-attempt.model';
import { PaymentAttemptView } from './payment-attempt.view';

export const PaymentAttemptPage = () => {
  const model = usePaymentAttemptModel();
  return <PaymentAttemptView {...model} />;
};
