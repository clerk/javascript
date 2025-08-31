'use client';

import type { ClerkProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import type { Without } from '@clerk/types';
import React from 'react';

import { mergeNextClerkPropsWithEnv } from './utils/mergeNextClerkPropsWithEnv';

type NextClerkProviderProps = Without<ClerkProviderProps, 'publishableKey'> & {
  /**
   * Used to override the default NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if needed.
   * This is optional for NextJS as the ClerkProvider will automatically use the NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if it exists.
   */
  publishableKey?: string;
};

export const ClerkProvider = (props: NextClerkProviderProps) => {
  const mergedProps = mergeNextClerkPropsWithEnv(props);
  return <ReactClerkProvider {...mergedProps}>{props.children}</ReactClerkProvider>;
};
