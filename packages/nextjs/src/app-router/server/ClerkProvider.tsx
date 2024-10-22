import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';
import { ClerkDynamicProvider } from './ClerkDynamicProvider';
import { getScriptNonceFromHeader } from './utils';

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;
  let state = {};
  let nonce = '';

  if (dynamic) {
    state = (await initialState())?.__clerk_ssr_state as InitialState;
    nonce = getScriptNonceFromHeader((await headers()).get('Content-Security-Policy') || '') || '';
  }

  const output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={nonce}
      initialState={state}
    >
      {children}
    </ClientClerkProvider>
  );

  if (dynamic) {
    return <ClerkDynamicProvider>{output}</ClerkDynamicProvider>;
  }

  return output;
}
