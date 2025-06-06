import { SubscriberTypeContext } from '../../contexts';
import { PaymentAttemptPage } from '../PaymentAttempts';

export const OrganizationPaymentAttemptPage = () => {
  return (
    <SubscriberTypeContext.Provider value='org'>
      <PaymentAttemptPage />
    </SubscriberTypeContext.Provider>
  );
};
