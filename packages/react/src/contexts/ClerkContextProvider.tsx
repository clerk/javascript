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
import { authStore } from '../stores/authStore';
import type { IsomorphicClerkOptions } from '../types';
import { AuthContext } from './AuthContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';

type ClerkContextProvider = {
  isomorphicClerkOptions: IsomorphicClerkOptions;
  initialState: InitialState | undefined;
  children: React.ReactNode;
};

export type ClerkContextProviderState = Resources;

export function ClerkContextProvider(props: ClerkContextProvider) {
  const { isomorphicClerkOptions, initialState, children } = props;
  const { isomorphicClerk: clerk } = useLoadedIsomorphicClerk(isomorphicClerkOptions);

  const [state, setState] = React.useState<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, [clerk]);

  const derivedState = deriveState(clerk.loaded, state, initialState);

  const { session, user, organization } = derivedState;

  // Set server snapshot for SSR/hydration and connect to Clerk for live updates
  React.useLayoutEffect(() => {
    if (initialState) {
      authStore.setServerSnapshot({
        actor: initialState.actor,
        factorVerificationAge: initialState.factorVerificationAge,
        orgId: initialState.orgId,
        orgPermissions: initialState.orgPermissions,
        orgRole: initialState.orgRole,
        orgSlug: initialState.orgSlug,
        sessionClaims: initialState.sessionClaims,
        sessionId: initialState.sessionId,
        sessionStatus: initialState.sessionStatus,
        userId: initialState.userId,
      });
    }

    authStore.connect(clerk);

    return () => {
      authStore.disconnect();
    };
  }, [clerk, initialState]);

  // This automatically handles SSR/hydration/client transitions!
  const authValue = React.useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getServerSnapshot);

  const clerkCtx = React.useMemo(() => ({ value: clerk }), [clerk]);
  const clientCtx = React.useMemo(() => ({ value: state.client }), [state.client]);

  const authCtx = React.useMemo(() => ({ value: authValue }), [authValue]);

  const sessionCtx = React.useMemo(() => ({ value: session }), [session]);
  const userCtx = React.useMemo(() => ({ value: user }), [user]);
  const organizationCtx = React.useMemo(() => ({ value: { organization } }), [organization]);

  return (
    // @ts-expect-error value passed is of type IsomorphicClerk where the context expects LoadedClerk
    <IsomorphicClerkContext.Provider value={clerkCtx}>
      <ClientContext.Provider value={clientCtx}>
        <SessionContext.Provider value={sessionCtx}>
          <OrganizationProvider {...organizationCtx.value}>
            <AuthContext.Provider value={authCtx}>
              <UserContext.Provider value={userCtx}>
                <CheckoutProvider
                  // @ts-expect-error - value is not used
                  value={undefined}
                >
                  {children}
                </CheckoutProvider>
              </UserContext.Provider>
            </AuthContext.Provider>
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
  }, [options]);

  React.useEffect(() => {
    const clerk = isomorphicClerkRef.current;
    clerk.on('status', setClerkStatus);
    return () => {
      if (clerk) {
        clerk.off('status', setClerkStatus);
      }
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk: isomorphicClerkRef.current, clerkStatus };
};
