import type { Ui } from '@clerk/react/internal';
import type { InitialState, Without } from '@clerk/shared/types';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { getKeylessStatus, KeylessProvider } from './keyless-provider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return data;
});

const getNonceHeaders = React.cache(async function getNonceHeaders() {
  const headersList = await headers();
  const nonce = headersList.get('X-Nonce');
  return nonce
    ? nonce
    : // Fallback to extracting from CSP header
      getScriptNonceFromHeader(headersList.get('Content-Security-Policy') || '') || '';
});

export async function ClerkProvider<TUi extends Ui = Ui>(
  props: Without<NextClerkProviderProps<TUi>, '__internal_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;

  async function generateStatePromise() {
    if (!dynamic) {
      return Promise.resolve(null);
    }
    return getDynamicClerkState();
  }

  async function generateNonce() {
    if (!dynamic) {
      return Promise.resolve('');
    }
    return getNonceHeaders();
  }

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
  });

  const { shouldRunAsKeyless, runningWithClaimedKeys } = await getKeylessStatus(propsWithEnvs);

  let output: ReactNode;

  try {
    const detectKeylessEnvDrift = await import('../../server/keyless-telemetry.js').then(
      mod => mod.detectKeylessEnvDrift,
    );
    await detectKeylessEnvDrift();
  } catch {
    // ignore
  }

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
