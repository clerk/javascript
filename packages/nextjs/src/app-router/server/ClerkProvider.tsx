import type { InitialState, Without } from '@clerk/types';
import React from 'react';

import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';

export function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange' | 'signInUrl' | 'signUpUrl'>,
) {
  const { children, ...rest } = props;
  const state = initialState()?.__clerk_ssr_state as InitialState;

  return (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      initialState={state}
    >
      {children}
    </ClientClerkProvider>
  );
}
