import { ClerkProvider as ReactClerkProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import { ScriptOnce } from '@tanstack/react-router';
import { getGlobalStartContext } from '@tanstack/react-start';
import { useEffect } from 'react';

import { isClient } from '../utils';
import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';
import { mergeWithPublicEnvs, parseUrlForNavigation, pickFromClerkInitState } from './utils';

export * from '@clerk/react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const awaitableNavigateRef: { current: ReturnType<typeof useAwaitableNavigate> | undefined } = { current: undefined };

export function ClerkProvider<TUi extends Ui = Ui>({
  children,
  ...providerProps
}: TanstackStartClerkProviderProps<TUi>): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();
  // @ts-expect-error: Untyped internal Clerk initial state
  const clerkInitialState = getGlobalStartContext()?.clerkInitialState ?? {};

  useEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  }, [awaitableNavigate]);

  const clerkInitState = isClient() ? (window as any).__clerk_init_state : clerkInitialState;

  const { clerkSsrState, __keylessClaimUrl, __keylessApiKeysUrl, ...restInitState } = pickFromClerkInitState(
    clerkInitState?.__internal_clerk_state,
  );

  const mergedProps = {
    ...mergeWithPublicEnvs(restInitState),
    ...providerProps,
  };

  // Add keyless mode props if present
  const keylessProps = __keylessClaimUrl
    ? {
        __internal_keyless_claimKeylessApplicationUrl: __keylessClaimUrl,
        __internal_keyless_copyInstanceKeysUrl: __keylessApiKeysUrl,
      }
    : {};

  return (
    <>
      <ScriptOnce>{`window.__clerk_init_state = ${JSON.stringify(clerkInitialState)};`}</ScriptOnce>
      <ClerkOptionsProvider options={mergedProps}>
        <ReactClerkProvider
          initialState={clerkSsrState}
          sdkMetadata={SDK_METADATA}
          routerPush={(to: string) => {
            const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
            return awaitableNavigateRef.current?.({
              ...rest,
              search: search as any,
              hash,
              replace: false,
            });
          }}
          routerReplace={(to: string) => {
            const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
            return awaitableNavigateRef.current?.({
              ...rest,
              search: search as any,
              hash,
              replace: true,
            });
          }}
          {...mergedProps}
          {...keylessProps}
        >
          {children}
        </ReactClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
