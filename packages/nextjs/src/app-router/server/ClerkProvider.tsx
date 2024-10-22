import type { Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { PromisifiedAuthProvider } from '../client/PromisifiedAuthProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = await getDynamicAuthData(request);

  return data;
});

const getNonceFromCSPHeader = React.cache(async function getNonceFromCSPHeader() {
  return getScriptNonceFromHeader((await headers()).get('Content-Security-Policy') || '') || '';
});

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;
  let statePromise = Promise.resolve({});
  let nonce = Promise.resolve('');

  if (dynamic) {
    statePromise = getDynamicClerkState();
    nonce = getNonceFromCSPHeader();
  }

  const output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={React.use(nonce)}
      initialState={React.use(statePromise)}
    >
      {children}
    </ClientClerkProvider>
  );

  if (dynamic) {
    return <PromisifiedAuthProvider authPromise={statePromise}>{output}</PromisifiedAuthProvider>;
  }

  return output;
}
