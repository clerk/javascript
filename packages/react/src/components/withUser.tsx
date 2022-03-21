import { UserResource } from '@clerk/types';
import React from 'react';

import { useUserContext } from '../contexts/UserContext';
import { hocChildrenNotAFunctionError } from '../errors';

export const withUser = <P extends { user: UserResource }>(Component: React.ComponentType<P>, displayName?: string) => {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC: React.FC<Omit<P, 'user'>> = (props: Omit<P, 'user'>) => {
    const user = useUserContext();

    if (!user) {
      return null;
    }

    return (
      <Component
        {...(props as P)}
        user={user}
      />
    );
  };

  HOC.displayName = `withUser(${displayName})`;
  return HOC;
};

export const WithUser: React.FC<{
  children: (user: UserResource) => React.ReactNode;
}> = ({ children }) => {
  const user = useUserContext();

  if (typeof children !== 'function') {
    throw new Error(hocChildrenNotAFunctionError);
  }

  if (!user) {
    return null;
  }

  return <>{children(user)}</>;
};
