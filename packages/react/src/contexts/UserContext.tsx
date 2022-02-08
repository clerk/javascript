import { UserResource } from '@clerk/types';
import React, { useContext } from 'react';

import {
  StructureContext,
  StructureContextStates,
} from '../contexts/StructureContext';
import { hocChildrenNotAFunctionError } from '../errors';
import { inBrowser } from '../utils';
import {
  assertUserGuarantee,
  assertWrappedByClerkProvider,
} from './assertHelpers';

type UserTypes = UserResource | null | undefined;
type UserContextValue = { value: UserTypes };
export const UserContext = React.createContext<UserContextValue | undefined>(
  undefined,
);
UserContext.displayName = 'UserContext';

export function useUserContext(): UserContextValue {
  const userCtx = useContext(UserContext);
  assertWrappedByClerkProvider(userCtx);
  return userCtx;
}

type UseUserWithAssertionsResponse = {
  user: UserTypes;
  isLoading: (user: UserTypes) => user is undefined;
  isSignedOut: (user: UserTypes) => user is null;
  isSignedIn: (user: UserTypes) => user is UserResource;
};

export function useUser(options?: { withAssertions: false }): UserResource;
export function useUser(options: {
  withAssertions: true;
}): UseUserWithAssertionsResponse;
export function useUser(options?: {
  withAssertions: boolean;
}): UserResource | UseUserWithAssertionsResponse {
  const opts = { ...options };
  opts.withAssertions = opts.withAssertions || false;

  const structureCtx = useContext(StructureContext);
  const userCtx = useUserContext();

  if (opts.withAssertions) {
    const assertions = {
      isLoading: (user: UserTypes): user is undefined => {
        return user === undefined;
      },
      isSignedOut: (user: UserTypes): user is null => {
        return user === null;
      },
      isSignedIn: (user: UserTypes): user is UserResource => {
        return !!user;
      },
    };
    return { user: userCtx.value, ...assertions };
  }

  assertWrappedByClerkProvider(structureCtx);
  assertUserGuarantee(structureCtx.guaranteedUser, 'useUser()');
  assertUserGuarantee(userCtx.value, 'useUser()');
  return userCtx.value;
}

export const withUser = <P extends { user: UserResource }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName =
    displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC: React.FC<Omit<P, 'user'>> = (props: Omit<P, 'user'>) => {
    const structureCtx = useContext(StructureContext);
    const userCtx = useContext(UserContext);
    if (!inBrowser()) {
      return null;
    }
    assertWrappedByClerkProvider(structureCtx);
    assertWrappedByClerkProvider(userCtx);
    const user = userCtx.value;

    if (structureCtx.guaranteedUser && user) {
      return <Component {...(props as P)} user={user} />;
    }

    if (user) {
      return (
        <StructureContext.Provider value={StructureContextStates.guaranteedAll}>
          <Component {...(props as P)} user={user} />
        </StructureContext.Provider>
      );
    }

    return null;
  };

  HOC.displayName = `withUser(${displayName})`;
  return HOC;
};

export const WithUser: React.FC<{
  children: (user: UserResource) => React.ReactNode;
}> = ({ children }) => (
  <StructureContext.Consumer>
    {structureCtx => (
      <UserContext.Consumer>
        {userCtx => {
          if (typeof children !== 'function') {
            throw new Error(hocChildrenNotAFunctionError);
          }

          assertWrappedByClerkProvider(structureCtx);
          assertWrappedByClerkProvider(userCtx);
          const user = userCtx.value;

          if (structureCtx.guaranteedUser && user) {
            return children(user);
          }

          if (user) {
            return (
              <StructureContext.Provider
                value={StructureContextStates.guaranteedAll}
              >
                {children(user)}
              </StructureContext.Provider>
            );
          }

          return null;
        }}
      </UserContext.Consumer>
    )}
  </StructureContext.Consumer>
);
