import { ClientContext, OrganizationProvider, SessionContext, UserContext } from '@clerk/shared/react';
import type { ClientResource, InitialState, Resources } from '@clerk/types';
import React, { type ScriptHTMLAttributes } from 'react';

import { IsomorphicClerk } from '../isomorphicClerk';
import type { IsomorphicClerkOptions } from '../types';
import { deriveState } from '../utils/deriveState';
import type { LoadClerkJsScriptOptions } from '../utils/loadClerkJsScript';
import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '../utils/loadClerkJsScript';
import { AuthContext } from './AuthContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';

type ClerkContextProvider = {
  isomorphicClerkOptions: IsomorphicClerkOptions;
  initialState: InitialState | undefined;
  children: React.ReactNode;
  ScriptComponent?: React.FunctionComponent<ScriptHTMLAttributes<HTMLScriptElement>>;
};

export type ClerkContextProviderState = Resources;

export function ClerkContextProvider(props: ClerkContextProvider): JSX.Element | null {
  const { isomorphicClerkOptions, initialState, children, ScriptComponent } = props;
  const { isomorphicClerk: clerk, loaded: clerkLoaded } = useLoadedIsomorphicClerk(isomorphicClerkOptions);

  const [state, setState] = React.useState<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization,
  });

  React.useEffect(() => {
    return clerk.addListener(e => setState({ ...e }));
  }, []);

  const derivedState = deriveState(clerkLoaded, state, initialState);
  const clerkCtx = React.useMemo(() => ({ value: clerk }), [clerkLoaded]);
  const clientCtx = React.useMemo(() => ({ value: state.client }), [state.client]);

  const { sessionId, session, userId, user, orgId, actor, organization, orgRole, orgSlug, orgPermissions } =
    derivedState;

  const authCtx = React.useMemo(() => {
    const value = { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions };
    return { value };
  }, [sessionId, userId, actor, orgId, orgRole, orgSlug]);
  const userCtx = React.useMemo(() => ({ value: user }), [userId, user]);
  const sessionCtx = React.useMemo(() => ({ value: session }), [sessionId, session]);
  const organizationCtx = React.useMemo(() => {
    const value = {
      organization: organization,
    };
    return { value };
  }, [orgId, organization]);

  return (
    <>
      <InlineClerkScript
        options={{
          ...isomorphicClerkOptions,
          domain: clerk?.domain,
          proxyUrl: clerk?.proxyUrl,
        }}
        ScriptComponent={ScriptComponent}
      />
      {/*// @ts-expect-error value passed is of type IsomorphicClerk where the context expects LoadedClerk*/}
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
    </>
  );
}

function InlineClerkScript({
  options,
  ScriptComponent: ScriptTag,
}: {
  options: LoadClerkJsScriptOptions;
  ScriptComponent?: ClerkContextProvider['ScriptComponent'];
}) {
  if (!ScriptTag) {
    /**
     * When a ScriptTag component is not provided, simply render nothing and let the default mechanism of IsomorphicClerk take over.
     */
    return null;
  }

  const scriptUrl = clerkJsScriptUrl(options);

  return (
    <ScriptTag
      src={scriptUrl}
      data-clerk-js-script
      async
      crossOrigin='anonymous'
      {...buildClerkJsScriptAttributes(options)}
    />
  );
}

const useLoadedIsomorphicClerk = (options: IsomorphicClerkOptions) => {
  const [loaded, setLoaded] = React.useState(false);
  const isomorphicClerk = React.useMemo(() => IsomorphicClerk.getOrCreateInstance(options), []);

  React.useEffect(() => {
    isomorphicClerk.__unstable__updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    isomorphicClerk.__unstable__updateProps({ options });
  }, [options.localization]);

  React.useEffect(() => {
    isomorphicClerk.addOnLoaded(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    return () => {
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk, loaded };
};
