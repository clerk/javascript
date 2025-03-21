import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { isNext13 } from '../../utils/sdk-versions';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { getKeylessStatus, KeylessProvider } from './keyless-provider';
import { ClerkProviderDebugLogger } from './logger';
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
  const { children, dynamic, debug, ...rest } = props;

  if (debug) {
    ClerkProviderDebugLogger.enable();
  }

  async function generateStatePromise() {
    if (!dynamic) {
      return Promise.resolve(null);
    }
    if (isNext13) {
      /**
       * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
       * Without the await here, Next will throw a DynamicServerError during build.
       */
      return Promise.resolve(await getDynamicClerkState());
    }
    return getDynamicClerkState();
  }

  async function generateNonce() {
    if (!dynamic) {
      return Promise.resolve('');
    }
    if (isNext13) {
      /**
       * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
       * Without the await here, Next will throw a DynamicServerError during build.
       */
      return Promise.resolve(await getNonceFromCSPHeader());
    }
    return getNonceFromCSPHeader();
  }

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
  });

  const { shouldRunAsKeyless, runningWithClaimedKeys } = await getKeylessStatus(propsWithEnvs);

  let output: ReactNode;

  if (shouldRunAsKeyless) {
    output = (
      <KeylessProvider
        rest={propsWithEnvs}
        generateNonce={generateNonce}
        generateStatePromise={generateStatePromise}
        runningWithClaimedKeys={runningWithClaimedKeys}
      >
        {children}
      </KeylessProvider>
    );
  } else {
    output = (
      <ClientClerkProvider
        {...propsWithEnvs}
        nonce={await generateNonce()}
        initialState={await generateStatePromise()}
      >
        {children}
      </ClientClerkProvider>
    );
  }

  if (dynamic) {
    return (
      // TODO: fix types so AuthObject is compatible with InitialState
      <PromisifiedAuthProvider authPromise={generateStatePromise() as unknown as Promise<InitialState>}>
        {output}
      </PromisifiedAuthProvider>
    );
  }
  return output;
}
