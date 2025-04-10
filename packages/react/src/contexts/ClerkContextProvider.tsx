import { deriveState } from '@clerk/shared/deriveState';
import { ClientContext, OrganizationProvider, SessionContext, UserContext } from '@clerk/shared/react';
import type { ClientResource, InitialState, Resources } from '@clerk/types';
import React from 'react';

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

  const derivedState = deriveState(clerk.loaded, state, initialState);
  const clerkCtx = React.useMemo(
    () => ({ value: clerk }),
    [
      // Only update the clerk reference on status change
      clerkStatus,
    ],
  );
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

  React.useEffect(() => {
    void isomorphicClerk.__unstable__updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    void isomorphicClerk.__unstable__updateProps({ options });
  }, [options.localization]);

  React.useEffect(() => {
    isomorphicClerk.on('status', setStatus);
    return () => isomorphicClerk.off('status', setStatus);
  }, [isomorphicClerk]);

  React.useEffect(() => {
    return () => {
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk, clerkStatus };
};
