import { deriveState } from '@clerk/shared/deriveState';
import {
  __experimental_CheckoutProvider as CheckoutProvider,
  ClientContext,
  OrganizationProvider,
  SessionContext,
  UserContext,
} from '@clerk/shared/react';
import type { ClientResource, InitialState, Resources } from '@clerk/shared/types';
import React from 'react';

import { IsomorphicClerk } from '../isomorphicClerk';
import type { IsomorphicClerkOptions } from '../types';
import { mergeWithEnv } from '../utils';
import { IS_REACT_SHARED_VARIANT_COMPATIBLE } from '../utils/versionCheck';
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
  // Merge options with environment variable fallbacks (supports Vite's VITE_CLERK_* env vars)
  const mergedOptions = mergeWithEnv(isomorphicClerkOptions);
  const { isomorphicClerk: clerk, clerkStatus } = useLoadedIsomorphicClerk(mergedOptions);

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
    sessionClaims,
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
      sessionClaims,
      userId,
      actor,
      orgId,
      orgRole,
      orgSlug,
      orgPermissions,
      factorVerificationAge,
    };
    return { value };
  }, [sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, factorVerificationAge, sessionClaims?.__raw]);

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
              <UserContext.Provider value={userCtx}>
                <CheckoutProvider
                  // @ts-expect-error - value is not used
                  value={undefined}
                >
                  {children}
                </CheckoutProvider>
              </UserContext.Provider>
            </AuthContext.Provider>
          </OrganizationProvider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </IsomorphicClerkContext.Provider>
  );
}

// Default clerkUIVariant based on React version compatibility.
// Computed once at module level for optimal performance.
const DEFAULT_CLERK_UI_VARIANT = IS_REACT_SHARED_VARIANT_COMPATIBLE ? ('shared' as const) : ('' as const);

const useLoadedIsomorphicClerk = (mergedOptions: IsomorphicClerkOptions) => {
  // Merge default clerkUIVariant with user options.
  // User-provided options spread last to allow explicit overrides.
  // The shared variant expects React to be provided via globalThis.__clerkSharedModules
  // (set up by @clerk/ui/register import), which reduces bundle size.
  const optionsWithDefaults = React.useMemo(
    () => ({
      clerkUIVariant: DEFAULT_CLERK_UI_VARIANT,
      ...mergedOptions,
    }),
    [mergedOptions],
  );
  const isomorphicClerkRef = React.useRef(IsomorphicClerk.getOrCreateInstance(optionsWithDefaults));
  const [clerkStatus, setClerkStatus] = React.useState(isomorphicClerkRef.current.status);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__internal_updateProps({ appearance: mergedOptions.appearance });
  }, [mergedOptions.appearance]);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__internal_updateProps({ options: mergedOptions });
  }, [mergedOptions.localization]);

  React.useEffect(() => {
    isomorphicClerkRef.current.on('status', setClerkStatus);
    return () => {
      if (isomorphicClerkRef.current) {
        isomorphicClerkRef.current.off('status', setClerkStatus);
      }
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk: isomorphicClerkRef.current, clerkStatus };
};
