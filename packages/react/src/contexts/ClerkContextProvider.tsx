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
import { AuthContext } from './AuthContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';

// Version bounds format: [major, minMinor, maxMinor, minPatch]
// - maxMinor === -1 means "any minor" (caret range, e.g., ^18.0.0)
// - maxMinor === minMinor means "same minor only" (tilde range, e.g., ~19.0.3)
declare const __CLERK_UI_SUPPORTED_REACT_BOUNDS__: Array<
  [major: number, minMinor: number, maxMinor: number, minPatch: number]
>;

/**
 * Checks if the host application's React version is compatible with @clerk/ui's shared variant.
 * The shared variant expects React to be provided via globalThis.__clerkSharedModules,
 * so we need to ensure the host's React version matches what @clerk/ui was built against.
 */
function isReactVersionCompatibleWithSharedVariant(): boolean {
  try {
    // Parse version string (e.g., "18.3.1" or "19.0.0-rc.1")
    const match = React.version.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) return false;

    const [, majorStr, minorStr, patchStr] = match;
    const major = parseInt(majorStr, 10);
    const minor = parseInt(minorStr, 10);
    const patch = parseInt(patchStr, 10);

    // Check against pre-computed bounds
    return __CLERK_UI_SUPPORTED_REACT_BOUNDS__.some(([bMajor, minMinor, maxMinor, minPatch]) => {
      if (major !== bMajor) return false;

      if (maxMinor === -1) {
        // Caret range: any minor >= minMinor, with patch check for minMinor
        return minor > minMinor || (minor === minMinor && patch >= minPatch);
      } else {
        // Tilde range: specific minor only
        return minor === maxMinor && patch >= minPatch;
      }
    });
  } catch {
    // If we can't determine compatibility, fall back to non-shared variant
    return false;
  }
}

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

const useLoadedIsomorphicClerk = (options: IsomorphicClerkOptions) => {
  // Default to 'shared' variant for @clerk/ui if the host's React version is compatible.
  // The shared variant expects React to be provided via globalThis.__clerkSharedModules
  // (set up by @clerk/ui/register import), which reduces bundle size.
  const defaultClerkUiVariant = React.useMemo(
    () => (isReactVersionCompatibleWithSharedVariant() ? ('shared' as const) : ('' as const)),
    [],
  );
  // Merge default clerkUiVariant with user options.
  // User-provided options spread last to allow explicit overrides.
  const optionsWithDefaults = React.useMemo(
    () => ({
      clerkUiVariant: defaultClerkUiVariant,
      ...options,
    }),
    [defaultClerkUiVariant, options],
  );
  const isomorphicClerkRef = React.useRef(IsomorphicClerk.getOrCreateInstance(optionsWithDefaults));
  const [clerkStatus, setClerkStatus] = React.useState(isomorphicClerkRef.current.status);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__internal_updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__internal_updateProps({ options });
  }, [options.localization]);

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
