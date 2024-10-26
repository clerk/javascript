import type { AuthObject } from '@clerk/backend';
import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return data;
});

const getNonceFromCSPHeader = React.cache(async function getNonceFromCSPHeader() {
  return getScriptNonceFromHeader((await headers()).get('Content-Security-Policy') || '') || '';
});

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;
  let statePromise: Promise<null | AuthObject> = Promise.resolve(null);
  let nonce = Promise.resolve('');

  if (dynamic) {
    statePromise = getDynamicClerkState();
    nonce = getNonceFromCSPHeader();
  }

  const output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={await nonce}
      initialState={await statePromise}
    >
      {children}
    </ClientClerkProvider>
  );

  if (dynamic) {
    return (
      // TODO: fix types so AuthObject is compatible with InitialState
      <PromisifiedAuthProvider authPromise={statePromise as unknown as Promise<InitialState>}>
        {output}
      </PromisifiedAuthProvider>
    );
  }

  return output;
}
