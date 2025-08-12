import { SubscriberTypeContext } from '../../contexts';
import { PaymentAttemptPage } from '../PaymentAttempts';

export const OrganizationPaymentAttemptPage = () => {
  return (
    <SubscriberTypeContext.Provider value='organization'>
      <PaymentAttemptPage />
    </SubscriberTypeContext.Provider>
  );
};
