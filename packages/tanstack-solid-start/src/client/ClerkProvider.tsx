import { ScriptOnce } from '@tanstack/solid-router';
import { getGlobalStartContext } from '@tanstack/solid-start';
import { ClerkProvider as SolidClerkProvider } from 'clerk-solidjs';
import type { JSXElement } from 'solid-js';
import { createEffect } from 'solid-js';

import { isClient } from '../utils';
import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';
import { mergeWithPublicEnvs, pickFromClerkInitState } from './utils';

export * from 'clerk-solidjs';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const awaitableNavigateRef: { current: ReturnType<typeof useAwaitableNavigate> | undefined } = { current: undefined };

export function ClerkProvider({ children, ...providerProps }: TanstackStartClerkProviderProps): JSXElement {
  const awaitableNavigate = useAwaitableNavigate();
  // @ts-expect-error: Untyped internal Clerk initial state
  const clerkInitialState = getGlobalStartContext()?.clerkInitialState ?? {};

  createEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  });

  const clerkInitState = isClient() ? (window as any).__clerk_init_state : clerkInitialState;

  const { clerkSsrState, ...restInitState } = pickFromClerkInitState(clerkInitState?.__internal_clerk_state);

  const mergedProps = {
    ...mergeWithPublicEnvs(restInitState),
    ...providerProps,
  };

  return (
    <>
      <ScriptOnce>{`window.__clerk_init_state = ${JSON.stringify(clerkInitialState)};`}</ScriptOnce>
      <ClerkOptionsProvider options={mergedProps}>
        <SolidClerkProvider
          initialState={clerkSsrState}
          sdkMetadata={SDK_METADATA}
          routerPush={(to: string) =>
            awaitableNavigateRef.current?.({
              to,
              replace: false,
            })
          }
          routerReplace={(to: string) =>
            awaitableNavigateRef.current?.({
              to,
              replace: true,
            })
          }
          {...mergedProps}
        >
          {children}
        </SolidClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
