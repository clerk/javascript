import { SWRConfig } from '@clerk/shared/react';
import type { Clerk, LoadedClerk, Resources } from '@clerk/types';
import React from 'react';

import { CoreClerkContext } from './CoreClerkContext';
import { CoreClientContext } from './CoreClientContext';
import { CoreOrganizationProvider } from './CoreOrganizationContext';
import { CoreSessionContext } from './CoreSessionContext';
import { CoreUserContext } from './CoreUserContext';
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
      value: {
        organization: organization,
        lastOrganizationInvitation: undefined,
        lastOrganizationMember: undefined,
      },
    }),
    [organization],
  );

  return (
    // @ts-ignore
    <SWRConfig value={{ provider: () => clerk.cache }}>
      <CoreClerkContext.Provider value={clerkCtx}>
        <CoreClientContext.Provider value={clientCtx}>
          <CoreSessionContext.Provider value={sessionCtx}>
            <CoreOrganizationProvider {...organizationCtx.value}>
              <CoreUserContext.Provider value={userCtx}>{props.children}</CoreUserContext.Provider>
            </CoreOrganizationProvider>
          </CoreSessionContext.Provider>
        </CoreClientContext.Provider>
      </CoreClerkContext.Provider>
    </SWRConfig>
  );
}
