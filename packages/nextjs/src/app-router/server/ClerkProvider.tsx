import type { Ui } from '@clerk/react/internal';
import type { InitialState, Without } from '@clerk/shared/types';
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

export async function ClerkProvider<TUi extends Ui = Ui>(
  props: Without<NextClerkProviderProps<TUi>, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;

  const statePromiseOrValue = dynamic ? getDynamicClerkState() : undefined;
  const noncePromiseOrValue = dynamic ? getNonceHeaders() : '';

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
    initialState: statePromiseOrValue as InitialState | Promise<InitialState> | undefined,
    nonce: await noncePromiseOrValue,
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
        runningWithClaimedKeys={runningWithClaimedKeys}
      >
        {children}
      </KeylessProvider>
    );
  }

  return <ClientClerkProvider {...propsWithEnvs}>{children}</ClientClerkProvider>;
}
