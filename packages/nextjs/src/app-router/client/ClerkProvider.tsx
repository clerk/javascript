'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { ClerkNextOptionsProvider } from '../../client-boundary/NextOptionsContext';
import { useSafeLayoutEffect } from '../../client-boundary/useSafeLayoutEffect';
import type { NextClerkProviderProps } from '../../types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

declare global {
  export interface Window {
    __clerk_nav_await: Array<(value: void) => void>;
    __clerk_nav: (to: string) => Promise<void>;
  }
}

export const ClientClerkProvider = (props: NextClerkProviderProps) => {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true } = props;
  const router = useRouter();
  const navigate = useAwaitableNavigate();

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = () => {
      // router.refresh();
    };
  }, []);

  useSafeLayoutEffect(() => {
    window.__unstable__onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralised place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        router.refresh();
      }
    };
  }, []);

  const mergedProps = { ...props, navigate };
  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      {/*// @ts-ignore*/}
      <ReactClerkProvider {...mergedProps} />
    </ClerkNextOptionsProvider>
  );
};
