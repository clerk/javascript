import {
  InternalClerkProvider as ReactClerkProvider,
  setClerkJSLoadingErrorPackageName,
  setErrorThrowerOptions,
  type Ui,
} from '@clerk/react/internal';
import { useRouter } from 'next/router';
import React from 'react';

import { useSafeLayoutEffect } from '../client-boundary/hooks/useSafeLayoutEffect';
import { ClerkNextOptionsProvider } from '../client-boundary/NextOptionsContext';
import type { NextClerkProviderProps } from '../types';
import { invalidateNextRouterCache } from '../utils/invalidateNextRouterCache';
import { mergeNextClerkPropsWithEnv } from '../utils/mergeNextClerkPropsWithEnv';
import { removeBasePath } from '../utils/removeBasePath';
import { RouterTelemetry } from '../utils/router-telemetry';
import { ClerkScripts } from './ClerkScripts';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJSLoadingErrorPackageName(PACKAGE_NAME);

export function ClerkProvider<TUi extends Ui = Ui>({ children, ...props }: NextClerkProviderProps<TUi>): JSX.Element {
  const { __internal_invokeMiddlewareOnAuthStateChange = true } = props;
  const { push, replace } = useRouter();
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  useSafeLayoutEffect(() => {
    window.__internal_onBeforeSetActive = invalidateNextRouterCache;
  }, []);

  useSafeLayoutEffect(() => {
    window.__internal_onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralized place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc.\
      if (__internal_invokeMiddlewareOnAuthStateChange) {
        void push(window.location.href);
      }
    };
  }, []);

  const navigate = (to: string) => push(removeBasePath(to));
  const replaceNavigate = (to: string) => replace(removeBasePath(to));
  const mergedProps = mergeNextClerkPropsWithEnv({
    ...props,
    routerPush: navigate,
    routerReplace: replaceNavigate,
  });
  // ClerkProvider automatically injects __clerk_ssr_state
  // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
  // @ts-expect-error initialState is hidden from the types as it's a private prop
  const initialState = props.authServerSideProps?.__clerk_ssr_state || props.__clerk_ssr_state;

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider
        {...mergedProps}
        initialState={initialState}
      >
        <RouterTelemetry />
        <ClerkScripts />
        {children}
      </ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
}
