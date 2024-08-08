import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';
import { getScriptNonceFromHeader } from './utils';

export function ClerkProvider(props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>) {
  const { children, ...rest } = props;
  const state = initialState()?.__clerk_ssr_state as InitialState;
  const cspHeader = headers().get('Content-Security-Policy');

  return (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={getScriptNonceFromHeader(cspHeader || '')}
      initialState={state}
    >
      {children}
    </ClientClerkProvider>
  );
}
