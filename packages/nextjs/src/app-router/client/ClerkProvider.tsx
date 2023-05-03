'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { ClerkNextOptionsProvider } from '../../client-boundary/NextOptionsContext';
import { useInvalidateCacheOnAuthChange } from '../../client-boundary/useInvalidateCacheOnAuthChange';
import { useInvokeMiddlewareOnAuthChange } from '../../client-boundary/useInvokeMiddlewareOnAuthChange';
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

  useInvalidateCacheOnAuthChange(() => {
    router.refresh();
  });

  useInvokeMiddlewareOnAuthChange(() => {
    if (__unstable_invokeMiddlewareOnAuthStateChange) {
      void navigate(window.location.href);
    }
  });

  const mergedProps = { ...props, navigate };
  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      {/*// @ts-ignore*/}
      <ReactClerkProvider {...mergedProps} />
    </ClerkNextOptionsProvider>
  );
};
