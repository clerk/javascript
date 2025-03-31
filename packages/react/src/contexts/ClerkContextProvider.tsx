import { deriveState } from '@clerk/shared/deriveState';
import { ClientContext, OrganizationProvider, SessionContext, UserContext } from '@clerk/shared/react';
import type { Clerk, ClientResource, InitialState, Resources } from '@clerk/types';
import React, { useEffect } from 'react';

import { IsomorphicClerk } from '../isomorphicClerk';
import type { IsomorphicClerkOptions } from '../types';
import { AuthContext } from './AuthContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';

type ClerkContextProvider = {
  isomorphicClerkOptions: IsomorphicClerkOptions;
  initialState: InitialState | undefined;
  children: React.ReactNode;
};

export type ClerkContextProviderState = Resources;

const isClerkJSOperational = (status: Clerk['status']) => ['ready', 'degraded'].includes(status);

export function ClerkContextProvider(props: ClerkContextProvider) {
  const { isomorphicClerkOptions, initialState, children } = props;
  const { isomorphicClerk: clerk, clerkStatus, clerkLoaded } = useLoadedIsomorphicClerk(isomorphicClerkOptions);

  const [state, setState] = React.useState<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const derivedState = deriveState(isClerkJSOperational(clerkStatus) ?? clerkLoaded, state, initialState);
  const clerkCtx = React.useMemo(() => ({ value: clerk }), [clerkStatus, clerkLoaded]);
  const clientCtx = React.useMemo(() => ({ value: state.client }), [state.client]);

  const {
    sessionId,
    sessionStatus,
    session,
    userId,
    user,
    orgId,
    actor,
    organization,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge,
  } = derivedState;

  const authCtx = React.useMemo(() => {
    const value = {
      sessionId,
      sessionStatus,
      userId,
      actor,
      orgId,
      orgRole,
      orgSlug,
      orgPermissions,
      factorVerificationAge,
    };
    return { value };
  }, [sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, factorVerificationAge]);
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
            <AuthContext.Provider value={authCtx}>
              <UserContext.Provider value={userCtx}>{children}</UserContext.Provider>
            </AuthContext.Provider>
          </OrganizationProvider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </IsomorphicClerkContext.Provider>
  );
}

const useLoadedIsomorphicClerk = (options: IsomorphicClerkOptions) => {
  const isomorphicClerk = React.useMemo(() => IsomorphicClerk.getOrCreateInstance(options), []);
  const [clerkStatus, setStatus] = React.useState(isomorphicClerk.status);
  const [loaded, setLoaded] = React.useState(isomorphicClerk.loaded);

  React.useEffect(() => {
    void isomorphicClerk.__unstable__updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    void isomorphicClerk.__unstable__updateProps({ options });
  }, [options.localization]);

  // const clerkStatus = useSyncExternalStore(
  //   (...a) => {
  //     console.log('Status update');
  //     return isomorphicClerk.addStatusListener(...a);
  //   },
  //   () => isomorphicClerk.status,
  //   () => isomorphicClerk.status,
  // );

  useEffect(() => {
    const unsub = isomorphicClerk.addStatusListener(setStatus);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => isomorphicClerk.addOnLoaded(() => setLoaded(true)), []);

  console.log('[clerkStatus]', clerkStatus, loaded);

  React.useEffect(() => {
    return () => {
      // reset to initial loading state
      isomorphicClerk.__internal_setStatus('loading');
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk, clerkStatus, clerkLoaded: loaded };
};
