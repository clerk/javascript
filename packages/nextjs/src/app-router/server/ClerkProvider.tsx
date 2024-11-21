import type { AuthObject } from '@clerk/backend';
import type { InitialState, Without } from '@clerk/types';
import { header } from 'ezheaders';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import { getHeader } from '../../server/utils';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { isNext13, isNextWithUnstableServerActions } from '../../utils/sdk-versions';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return data;
});

const getDynamicConfig = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const encoded = getHeader(request, 'x-clerk-public-request-config');

  if (encoded) {
    return JSON.parse(encoded);
  }
  return {};
});

const getNonceFromCSPHeader = React.cache(async function getNonceFromCSPHeader() {
  return getScriptNonceFromHeader((await header('Content-Security-Policy')) || '') || '';
});

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;
  let statePromise: Promise<null | AuthObject> = Promise.resolve(null);
  let nonce = Promise.resolve('');

  if (dynamic) {
    if (isNext13) {
      /**
       * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
       * Without the await here, Next will throw a DynamicServerError during build.
       */
      statePromise = Promise.resolve(await getDynamicClerkState());
      nonce = Promise.resolve(await getNonceFromCSPHeader());
    } else {
      statePromise = getDynamicClerkState();
      nonce = getNonceFromCSPHeader();
    }
  }

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
  });

  let output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={await nonce}
      initialState={await statePromise}
    >
      {children}
    </ClientClerkProvider>
  );
  if (!propsWithEnvs.publishableKey && !isNextWithUnstableServerActions && process.env.NODE_ENV === 'development') {
    const dynamicConfig = await getDynamicConfig();

    const newOrReadKeys = dynamicConfig.accountlessMode
      ? await import('../../server/accountless-node.js').then(mod => mod.createAccountlessKeys())
      : undefined;

    if (newOrReadKeys) {
      const AccountlessCookieSync = await import('../client/accountless-cookie-sync.js').then(
        mod => mod.AccountlessCookieSync,
      );
      output = (
        <AccountlessCookieSync {...newOrReadKeys}>
          <ClientClerkProvider
            {...mergeNextClerkPropsWithEnv({
              ...rest,
              publishableKey: newOrReadKeys.publishableKey,
              claimAccountlessKeysUrl: newOrReadKeys.claimUrl,
            })}
            nonce={await nonce}
            initialState={await statePromise}
          >
            {children}
          </ClientClerkProvider>
        </AccountlessCookieSync>
      );
    }
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
