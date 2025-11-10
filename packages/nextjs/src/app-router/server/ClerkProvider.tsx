import type { InitialState, Without } from '@clerk/shared/types';
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

async function generateStatePromise(dynamic: boolean) {
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

async function generateNonce(dynamic: boolean) {
  if (!dynamic) {
    return Promise.resolve('');
  }
  if (isNext13) {
    /**
     * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
     * Without the await here, Next will throw a DynamicServerError during build.
     */
    return Promise.resolve(await getNonceHeaders());
  }
  return getNonceHeaders();
}

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;

  const statePromise = generateStatePromise(!!dynamic);
  const noncePromise = generateNonce(!!dynamic);

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
        noncePromise={noncePromise}
        statePromise={statePromise}
        runningWithClaimedKeys={runningWithClaimedKeys}
      >
        {children}
      </KeylessProvider>
    );
  } else {
    output = (
      <ClientClerkProvider
        {...propsWithEnvs}
        nonce={await noncePromise}
        initialState={await statePromise}
      >
        {children}
      </ClientClerkProvider>
    );
  }

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
