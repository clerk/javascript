import { __internal__setErrorThrowerOptions, ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouter } from 'next/router';
import React from 'react';

import { ClerkNextOptionsProvider } from '../client-boundary/NextOptionsContext';
import { useSafeLayoutEffect } from '../client-boundary/useSafeLayoutEffect';
import type { NextClerkProviderProps } from '../types';
import { invalidateNextRouterCache } from '../utils/invalidateNextRouterCache';
import { mergeNextClerkPropsWithEnv } from '../utils/mergeNextClerkPropsWithEnv';

__internal__setErrorThrowerOptions({ packageName: '@clerk/nextjs' });

export function ClerkProvider({ children, ...props }: NextClerkProviderProps): JSX.Element {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true } = props;
  const { push } = useRouter();
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = invalidateNextRouterCache;
  }, []);

  useSafeLayoutEffect(() => {
    window.__unstable__onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralised place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc.\
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        void push(window.location.href);
      }
    };
  }, []);

  const navigate = (to: string) => push(to);
  const mergedProps = mergeNextClerkPropsWithEnv({ ...props, navigate });
  // withServerSideAuth automatically injects __clerk_ssr_state
  // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
  // @ts-expect-error initialState is hidden from the types as it's a private prop
  const initialState = props.authServerSideProps?.__clerk_ssr_state || props.__clerk_ssr_state;

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      {/*@ts-expect-error*/}
      <ReactClerkProvider
        {...mergedProps}
        initialState={initialState}
      >
        {children}
      </ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
}
