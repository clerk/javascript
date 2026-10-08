import { usePaymentAttemptsListModel } from './payment-attempts-list.model';
import { PaymentAttemptsListView } from './payment-attempts-list.view';

/* -------------------------------------------------------------------------------------------------
 * PaymentAttemptsList
 * -----------------------------------------------------------------------------------------------*/

export const PaymentAttemptsList = () => {
  const model = usePaymentAttemptsListModel();
  return <PaymentAttemptsListView {...model} />;
};
