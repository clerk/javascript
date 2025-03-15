import {
  ClerkInstanceContext,
  ClientContext,
  OrganizationProvider,
  SessionContext,
  UserContext,
} from '@clerk/shared/react';
import type { Clerk, LoadedClerk, Resources } from '@clerk/types';
import React from 'react';

import { makeUICaller } from '../../utils/detect-ui-caller';
import { assertClerkSingletonExists } from './utils';

type CoreClerkContextWrapperProps = {
  clerk: Clerk;
  children: React.ReactNode;
  swrConfig?: any;
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
  const clerkCtx = React.useMemo(() => ({ value: makeUICaller(clerk) }), []);
  const clientCtx = React.useMemo(() => ({ value: makeUICaller(client) }), [client]);
  const sessionCtx = React.useMemo(() => ({ value: makeUICaller(session) }), [session]);
  const userCtx = React.useMemo(() => ({ value: makeUICaller(user) }), [user]);

  const organizationCtx = React.useMemo(
    () => ({
      value: { organization: organization },
    }),
    [organization],
  );

  return (
    <ClerkInstanceContext.Provider value={clerkCtx}>
      <ClientContext.Provider value={clientCtx}>
        <SessionContext.Provider value={sessionCtx}>
          <OrganizationProvider
            {...organizationCtx.value}
            swrConfig={props.swrConfig}
          >
            <UserContext.Provider value={userCtx}>{props.children}</UserContext.Provider>
          </OrganizationProvider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </ClerkInstanceContext.Provider>
  );
}
