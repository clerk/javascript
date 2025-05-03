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
    __experimental_commerce?.__experimental_billing.getStatements,
    { ...(subscriberType === 'org' ? { orgId: organization?.id } : {}) },
    undefined,
    `commerce-statements-${user?.id}`,
  );
  const { data: statements, total_count: totalCount } = data || { data: [], totalCount: 0 };

  const getStatementById = (statementId: string) => {
    return statements.find(statement => statement.id === statementId);
  };

  return (
    <StatementsContext.Provider
      value={{
        componentName: 'Statements',
        statements,
        totalCount: totalCount || 0,
        isLoading: isLoading || false,
        revalidate,
        getStatementById,
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
