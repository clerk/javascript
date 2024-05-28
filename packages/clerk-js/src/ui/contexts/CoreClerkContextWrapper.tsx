import {
  ClerkInstanceContext,
  ClientContext,
  OrganizationProvider,
  SessionContext,
  SWRConfig,
  UserContext,
} from '@clerk/shared/react';
import type { Clerk, LoadedClerk, Resources } from '@clerk/types';
import React from 'react';

import { assertClerkSingletonExists } from './utils';

type CoreClerkContextWrapperProps = {
  clerk: Clerk;
  children: React.ReactNode;
};

type CoreClerkContextProviderState = Resources;

export function CoreClerkContextWrapper(props: CoreClerkContextWrapperProps): JSX.Element | null {
  // TODO: Revise Clerk and LoadedClerk
  const clerk = props.clerk as LoadedClerk;
  assertClerkSingletonExists(clerk);

  const [state, setState] = React.useState<CoreClerkContextProviderState>({
    client: clerk.client,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const { client, session, user, organization } = state;
  const clerkCtx = React.useMemo(() => ({ value: clerk }), []);
  const clientCtx = React.useMemo(() => ({ value: client }), [client]);
  const sessionCtx = React.useMemo(() => ({ value: session }), [session]);
  const userCtx = React.useMemo(() => ({ value: user }), [user]);
  const organizationCtx = React.useMemo(
    () => ({
      value: { organization: organization },
    }),
    [organization],
  );

  return (
    <SWRConfig value={{ provider: () => clerk.__internal_requestCache }}>
      <ClerkInstanceContext.Provider value={clerkCtx}>
        <ClientContext.Provider value={clientCtx}>
          <SessionContext.Provider value={sessionCtx}>
            <OrganizationProvider {...organizationCtx.value}>
              <UserContext.Provider value={userCtx}>{props.children}</UserContext.Provider>
            </OrganizationProvider>
          </SessionContext.Provider>
        </ClientContext.Provider>
      </ClerkInstanceContext.Provider>
    </SWRConfig>
  );
}
