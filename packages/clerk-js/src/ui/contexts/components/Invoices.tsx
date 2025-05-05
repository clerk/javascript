import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { useFetch } from '../../hooks';
import type { InvoicesCtx } from '../../types';
import { useSubscriberTypeContext } from './SubscriberType';

const InvoicesContext = createContext<InvoicesCtx | null>(null);

export const InvoicesContextProvider = ({ children }: PropsWithChildren) => {
  const { billing } = useClerk();
  const { organization } = useOrganization();
  const subscriberType = useSubscriberTypeContext();
  const { user } = useUser();

  const resource = subscriberType === 'org' ? organization : user;

  const { data, isLoading, revalidate } = useFetch(
    billing.getInvoices,
    { ...(subscriberType === 'org' ? { orgId: organization?.id } : {}) },
    undefined,
    `commerce-invoices-${resource?.id}`,
  );
  const { data: invoices, total_count: totalCount } = data || { data: [], totalCount: 0 };

  const getInvoiceById = (invoiceId: string) => {
    return invoices.find(invoice => invoice.id === invoiceId);
  };

  return (
    <InvoicesContext.Provider
      value={{
        componentName: 'Invoices',
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
    throw new Error('Clerk: useInvoicesContext called outside Invoices.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
