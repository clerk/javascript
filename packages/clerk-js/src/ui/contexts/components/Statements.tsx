import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { useFetch } from '../../hooks';
import type { __experimental_StatementsCtx } from '../../types';
import { useSubscriberTypeContext } from './SubscriberType';

const StatementsContext = createContext<__experimental_StatementsCtx | null>(null);

export const StatementsContextProvider = ({ children }: PropsWithChildren) => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const subscriberType = useSubscriberTypeContext();
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
    <StatementsContext.Provider
      value={{
        componentName: 'Statements',
        invoices,
        totalCount: totalCount || 0,
        isLoading: isLoading || false,
        revalidate,
        getInvoiceById,
      }}
    >
      {children}
    </StatementsContext.Provider>
  );
};

export const useStatementsContext = () => {
  const context = useContext(StatementsContext);

  if (!context || context.componentName !== 'Statements') {
    throw new Error('Clerk: useStatementsContext called outside Statements.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
