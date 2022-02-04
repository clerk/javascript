import { ClientResource, Resources } from '@clerk/types';
import React from 'react';

import IsomorphicClerk from '../isomorphicClerk';
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

export function ClerkContextWrapper({
  isomorphicClerk,
  children,
  clerkLoaded,
}: ClerkContextWrapperProps): JSX.Element | null {
  const clerk = isomorphicClerk;

  const [state, setState] = React.useState<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const { client, session, user } = state;
  const clerkCtx = React.useMemo(() => ({ value: clerk }), [clerkLoaded]);
  const clientCtx = React.useMemo(() => ({ value: client }), [client]);
  const sessionCtx = React.useMemo(() => ({ value: session }), [session]);
  const userCtx = React.useMemo(() => ({ value: user }), [user]);

  return (
    <IsomorphicClerkContext.Provider value={clerkCtx}>
      <ClientContext.Provider value={clientCtx}>
        <SessionContext.Provider value={sessionCtx}>
          <UserContext.Provider value={userCtx}>
            <React.Fragment key={session ? session.id : 'no-users'}>
              {children}
            </React.Fragment>
          </UserContext.Provider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </IsomorphicClerkContext.Provider>
  );
}
