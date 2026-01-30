import { ClerkContextProvider } from '@clerk/shared/react';
import type { Ui } from '@clerk/ui/internal';
import React from 'react';

import { multipleClerkProvidersError } from '../errors/messages';
import { IsomorphicClerk } from '../isomorphicClerk';
import type { ClerkProviderProps, IsomorphicClerkOptions } from '../types';
import { mergeWithEnv, withMaxAllowedInstancesGuard } from '../utils';
import { IS_REACT_SHARED_VARIANT_COMPATIBLE } from '../utils/versionCheck';

function ClerkProviderBase<TUi extends Ui>(props: ClerkProviderProps<TUi>) {
  const { initialState, children, ...restIsomorphicClerkOptions } = props;

  // Merge options with environment variable fallbacks (supports Vite's VITE_CLERK_* env vars)
  const mergedOptions = mergeWithEnv(restIsomorphicClerkOptions as unknown as IsomorphicClerkOptions);
  const { isomorphicClerk, clerkStatus } = useLoadedIsomorphicClerk(mergedOptions);

  return (
    <ClerkContextProvider
      initialState={initialState}
      // @ts-expect-error - Fixme!
      clerk={isomorphicClerk}
      clerkStatus={clerkStatus}
    >
      {children}
    </ClerkContextProvider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };

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
