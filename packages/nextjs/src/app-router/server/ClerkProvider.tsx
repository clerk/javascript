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
  props: Without<NextClerkProviderProps<TUi>, '__internal_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;

  const statePromiseOrValue = dynamic ? getDynamicClerkState() : undefined;
  const noncePromiseOrValue = dynamic ? getNonceHeaders() : '';

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
    // Even though we always cast to InitialState here, this might still be a promise.
    // While not reflected in the public types, we do support this for React >= 19 for internal use.
    initialState: statePromiseOrValue as InitialState | undefined,
    nonce: await noncePromiseOrValue,
  });

  const { shouldRunAsKeyless, runningWithClaimedKeys } = await getKeylessStatus(propsWithEnvs);

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
