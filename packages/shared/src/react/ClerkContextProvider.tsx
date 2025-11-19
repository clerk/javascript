import React from 'react';

import { deriveState } from '../deriveState';
import type { Clerk, ClerkStatus, InitialState, LoadedClerk, Resources } from '../types';
import {
  __experimental_CheckoutProvider as CheckoutProvider,
  ClerkInstanceContext,
  ClientContext,
  InitialStateProvider,
  OrganizationProvider,
  SessionContext,
  UserContext,
} from './contexts';
import { assertClerkSingletonExists } from './utils';

type ClerkContextProps = {
  clerk: Clerk;
  clerkStatus?: ClerkStatus;
  children: React.ReactNode;
  swrConfig?: any;
  initialState?: InitialState;
};

type CoreClerkContextProviderState = Resources;

export function ClerkContextProvider(props: ClerkContextProps): JSX.Element | null {
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

  const clerkCtx = React.useMemo(
    () => ({ value: clerk }),
    // clerkStatus is a way to control the referential integrity of the clerk object from the outside,
    // we only change the context value when the status changes. Since clerk is mutable, any read from
    // the object will always be the latest value anyway.
    [props.clerkStatus],
  );
  const clientCtx = React.useMemo(() => ({ value: state.client }), [state.client]);

  const resolvedState = deriveState(clerk.loaded, state, props.initialState);
  const { session, user, organization } = resolvedState;

  const sessionCtx = React.useMemo(() => ({ value: session }), [session]);
  const userCtx = React.useMemo(() => ({ value: user }), [user]);
  const organizationCtx = React.useMemo(
    () => ({
      value: { organization: organization },
    }),
    [organization],
  );

  return (
    <InitialStateProvider initialState={props.initialState}>
      <ClerkInstanceContext.Provider value={clerkCtx}>
        <ClientContext.Provider value={clientCtx}>
          <SessionContext.Provider value={sessionCtx}>
            <OrganizationProvider
              {...organizationCtx.value}
              swrConfig={props.swrConfig}
            >
              <UserContext.Provider value={userCtx}>
                <CheckoutProvider
                  // @ts-expect-error - value is not used
                  value={undefined}
                >
                  {props.children}
                </CheckoutProvider>
              </UserContext.Provider>
            </OrganizationProvider>
          </SessionContext.Provider>
        </ClientContext.Provider>
      </ClerkInstanceContext.Provider>
    </InitialStateProvider>
  );
}
