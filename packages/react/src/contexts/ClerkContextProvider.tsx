import { deriveState } from '@clerk/shared/deriveState';
import {
  __experimental_CheckoutProvider as CheckoutProvider,
  ClientContext,
  OrganizationProvider,
  SessionContext,
  UserContext,
} from '@clerk/shared/react';
import type { ClientResource, InitialState, Resources } from '@clerk/shared/types';
import React from 'react';

import { IsomorphicClerk } from '../isomorphicClerk';
import type { IsomorphicClerkOptions } from '../types';
import { AuthStateProvider, InitialAuthStateProvider } from './AuthContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';

type ClerkContextProvider = {
  isomorphicClerkOptions: IsomorphicClerkOptions;
  initialState: InitialState | undefined;
  children: React.ReactNode;
};

export type ClerkContextProviderState = Resources;

export function ClerkContextProvider(props: ClerkContextProvider) {
  const { isomorphicClerkOptions, initialState, children } = props;
  const { isomorphicClerk: clerk, clerkStatus } = useLoadedIsomorphicClerk(isomorphicClerkOptions);

  const [state, setState] = React.useState<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const clerkCtx = React.useMemo(
    () => ({ value: clerk }),
    [
      // Only update the clerk reference on status change
      clerkStatus,
    ],
  );
  const clientCtx = React.useMemo(() => ({ value: state.client }), [state.client]);

  const resolvedState = deriveState(clerk.loaded, state, initialState);
  const { sessionId, session, userId, user, orgId, organization } = resolvedState;

  const sessionCtx = React.useMemo(() => ({ value: session }), [sessionId, session]);
  const userCtx = React.useMemo(() => ({ value: user }), [userId, user]);
  const organizationCtx = React.useMemo(() => {
    const value = {
      organization: organization,
    };
    return { value };
  }, [orgId, organization]);

  return (
    // @ts-expect-error value passed is of type IsomorphicClerk where the context expects LoadedClerk
    <IsomorphicClerkContext.Provider value={clerkCtx}>
      <ClientContext.Provider value={clientCtx}>
        <SessionContext.Provider value={sessionCtx}>
          <OrganizationProvider {...organizationCtx.value}>
            <InitialAuthStateProvider initialState={initialState}>
              <AuthStateProvider state={state}>
                <UserContext.Provider value={userCtx}>
                  <CheckoutProvider
                    // @ts-expect-error - value is not used
                    value={undefined}
                  >
                    {children}
                  </CheckoutProvider>
                </UserContext.Provider>
              </AuthStateProvider>
            </InitialAuthStateProvider>
          </OrganizationProvider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </IsomorphicClerkContext.Provider>
  );
}

const useLoadedIsomorphicClerk = (options: IsomorphicClerkOptions) => {
  const isomorphicClerkRef = React.useRef(IsomorphicClerk.getOrCreateInstance(options));
  const [clerkStatus, setClerkStatus] = React.useState(isomorphicClerkRef.current.status);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__unstable__updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__unstable__updateProps({ options });
  }, [options.localization]);

  React.useEffect(() => {
    isomorphicClerkRef.current.on('status', setClerkStatus);
    return () => {
      if (isomorphicClerkRef.current) {
        isomorphicClerkRef.current.off('status', setClerkStatus);
      }
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk: isomorphicClerkRef.current, clerkStatus };
};
