import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __experimental_CommerceSubscriberType } from '@clerk/types';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import { useFetch } from '../../hooks';
import type { __experimental_InvoicesCtx } from '../../types';

const InvoicesContext = createContext<__experimental_InvoicesCtx | null>(null);

export const InvoicesContextProvider = ({
  subscriberType,
  children,
}: {
  subscriberType?: __experimental_CommerceSubscriberType;
  children: ReactNode;
}) => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();

  const { user } = useUser();
  const { data, isLoading, revalidate } = useFetch(
    __experimental_commerce?.__experimental_billing.getInvoices,
    { ...(subscriberType === 'org' ? { orgId: organization?.id } : {}) },
    undefined,
    `commerce-invoices-${user?.id}`,
  );
  const { data: invoices, total_count: totalCount } = data || { data: [], totalCount: 0 };

  const getInvoiceById = (invoiceId: string) => {
    return invoices.find(invoice => invoice.id === invoiceId);
  };

  return (
    <InvoicesContext.Provider
      value={{
        componentName: 'Invoices',
        subscriberType: subscriberType || 'user',
        invoices,
        totalCount: totalCount || 0,
        isLoading: isLoading || false,
        revalidate,
        getInvoiceById,
      }}
    >
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoicesContext = () => {
  const context = useContext(InvoicesContext);

  if (!context || context.componentName !== 'Invoices') {
    throw new Error('Clerk: usePaymentSourcesContext called outside PaymentSources.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
