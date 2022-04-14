import { ActiveSessionResource, ClientResource, InitialState, Resources, UserResource } from '@clerk/types';
import React from 'react';

import IsomorphicClerk from '../isomorphicClerk';
import { AuthContext } from './AuthContext';
import { ClientContext } from './ClientContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';
import { SessionContext } from './SessionContext';
import { UserContext } from './UserContext';

type ClerkContextWrapperProps = {
  isomorphicClerk: IsomorphicClerk;
  children: React.ReactNode;
  clerkLoaded: boolean;
};

type ClerkContextProviderState = Resources;

export function ClerkContextProvider({
  isomorphicClerk,
  children,
  clerkLoaded,
}: ClerkContextWrapperProps): JSX.Element | null {
  const clerk = isomorphicClerk;

  const initialState = clerk.initialState;
  const [state, setState] = React.useState<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
  });
  const derivedState = deriveState(clerkLoaded, state, initialState);

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const clerkCtx = React.useMemo(() => ({ value: clerk }), [clerkLoaded]);
  const clientCtx = React.useMemo(() => ({ value: state.client }), [state.client]);

  const authCtx = React.useMemo(() => {
    return {
      value: { sessionId: derivedState.sessionId, userId: derivedState.userId },
    };
  }, [derivedState.sessionId, derivedState.userId]);

  const userCtx = React.useMemo(() => {
    return { value: derivedState.user };
  }, [derivedState.userId, derivedState.user]);

  const sessionCtx = React.useMemo(() => {
    return { value: derivedState.session };
  }, [derivedState.sessionId, derivedState.session]);

  return (
    <IsomorphicClerkContext.Provider value={clerkCtx}>
      <ClientContext.Provider value={clientCtx}>
        <SessionContext.Provider value={sessionCtx}>
          <AuthContext.Provider value={authCtx}>
            <UserContext.Provider value={userCtx}>{children}</UserContext.Provider>
          </AuthContext.Provider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </IsomorphicClerkContext.Provider>
  );
}

// This should be provided from isomorphicClerk
// TODO: move inside isomorphicClerk
function deriveState(
  clerkLoaded: boolean,
  state: ClerkContextProviderState,
  initialState: InitialState | undefined,
): {
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  session: ActiveSessionResource | null | undefined;
  user: UserResource | null | undefined;
} {
  if (!clerkLoaded && initialState) {
    const userId = initialState.userId;
    // TODO: Instantiate an actual user resource
    const user = initialState.user as any as UserResource;
    const sessionId = initialState.sessionId;
    // TODO: Instantiate an actual session resource
    const session = initialState.session as any as ActiveSessionResource;
    return { sessionId, session, userId, user };
  }
  const userId: string | null | undefined = state.user ? state.user.id : state.user;
  const user = state.user;
  const sessionId: string | null | undefined = state.session ? state.session.id : state.session;
  const session = state.session;
  return { sessionId, session, userId, user };
}
