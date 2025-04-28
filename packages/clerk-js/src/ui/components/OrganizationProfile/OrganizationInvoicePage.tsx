import { SubscriberTypeContext } from '../../contexts';
import { InvoicePage } from '../Invoices';

export const OrganizationInvoicePage = () => {
  return (
    <SubscriberTypeContext.Provider value='org'>
      <InvoicePage />
    </SubscriberTypeContext.Provider>
  );
};
