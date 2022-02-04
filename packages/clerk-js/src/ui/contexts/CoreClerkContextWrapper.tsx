import type { Clerk, LoadedClerk, Resources } from '@clerk/types';
import React from 'react';
import { CoreClientContext } from 'ui/contexts/CoreClientContext';
import { CoreSessionContext } from 'ui/contexts/CoreSessionContext';
import { CoreUserContext } from 'ui/contexts/CoreUserContext';
import { assertClerkSingletonExists } from 'ui/contexts/utils';

import { CoreClerkContext } from './CoreClerkContext';

type CoreClerkContextWrapperProps = {
  clerk: Clerk;
  children: React.ReactNode;
};

type CoreClerkContextProviderState = Resources;

export function CoreClerkContextWrapper(
  props: CoreClerkContextWrapperProps,
): JSX.Element | null {
  // TODO: Revise Clerk and LoadedClerk
  const clerk = props.clerk as LoadedClerk;
  assertClerkSingletonExists(clerk);

  const [state, setState] = React.useState<CoreClerkContextProviderState>({
    client: clerk.client,
    session: clerk.session,
    user: clerk.user,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const { client, session, user } = state;
  const clientCtx = React.useMemo(() => ({ value: client }), [client]);
  const sessionCtx = React.useMemo(() => ({ value: session }), [session]);
  const userCtx = React.useMemo(() => ({ value: user }), [user]);

  return (
    <CoreClerkContext.Provider value={clerk}>
      <CoreClientContext.Provider value={clientCtx}>
        <CoreSessionContext.Provider value={sessionCtx}>
          <CoreUserContext.Provider value={userCtx}>
            {props.children}
          </CoreUserContext.Provider>
        </CoreSessionContext.Provider>
      </CoreClientContext.Provider>
    </CoreClerkContext.Provider>
  );
}
