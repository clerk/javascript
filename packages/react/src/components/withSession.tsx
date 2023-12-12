import type { SessionResource } from '@clerk/types';
import React from 'react';

import { useSessionContext } from '../contexts/SessionContext';
import { errorThrower } from '../errors/errorThrower';
import { hocChildrenNotAFunctionError } from '../errors/messages';

export const withSession = <P extends { session: SessionResource }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC: React.FC<Omit<P, 'session'>> = (props: Omit<P, 'session'>) => {
    const session = useSessionContext();

    if (!session) {
      return null;
    }

    return (
      <Component
        {...(props as P)}
        session={session}
      />
    );
  };

  HOC.displayName = `withSession(${displayName})`;
  return HOC;
};

export const WithSession: React.FC<{
  children: (session: SessionResource) => React.ReactNode;
}> = ({ children }) => {
  const session = useSessionContext();

  if (typeof children !== 'function') {
    errorThrower.throw(hocChildrenNotAFunctionError);
  }

  if (!session) {
    return null;
  }

  return <>{children(session)}</>;
};
