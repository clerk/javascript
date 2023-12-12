import type { UserResource } from '@clerk/types';
import React from 'react';

import { useUserContext } from '../contexts/UserContext';
import { errorThrower } from '../errors/errorThrower';
import { hocChildrenNotAFunctionError } from '../errors/messages';

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
    errorThrower.throw(hocChildrenNotAFunctionError);
  }

  if (!user) {
    return null;
  }

  return <>{children(user)}</>;
};
