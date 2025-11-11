import type { Without } from '@clerk/shared/types';
import { headers } from 'next/headers';
import React from 'react';

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

async function generateStatePromise(dynamic: boolean) {
  if (!dynamic) {
    return Promise.resolve(null);
  }
  return getDynamicClerkState();
}

async function generateNonce(dynamic: boolean) {
  if (!dynamic) {
    return Promise.resolve('');
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

  try {
    const detectKeylessEnvDrift = await import('../../server/keyless-telemetry.js').then(
      mod => mod.detectKeylessEnvDrift,
    );
    await detectKeylessEnvDrift();
  } catch {
    // ignore
  }

  if (shouldRunAsKeyless) {
    return (
      <KeylessProvider
        rest={propsWithEnvs}
        noncePromise={noncePromise}
        statePromise={statePromise}
        runningWithClaimedKeys={runningWithClaimedKeys}
      >
        {children}
      </KeylessProvider>
    );
  }

  return (
    <ClientClerkProvider
      {...propsWithEnvs}
      nonce={await noncePromise}
      initialState={await statePromise}
    >
      {children}
    </ClientClerkProvider>
  );
}
