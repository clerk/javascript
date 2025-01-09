import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless__server } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { isNext13 } from '../../utils/sdk-versions';
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

  async function generateStatePromise() {
    if (dynamic) {
      if (isNext13) {
        /**
         * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
         * Without the await here, Next will throw a DynamicServerError during build.
         */
        return Promise.resolve(await getDynamicClerkState());
      } else {
        return getDynamicClerkState();
      }
    }
    return Promise.resolve(null);
  }

  async function generateNonce() {
    if (dynamic) {
      if (isNext13) {
        /**
         * For some reason, Next 13 requires that functions which call `headers()` are awaited where they are invoked.
         * Without the await here, Next will throw a DynamicServerError during build.
         */
        return Promise.resolve(await getNonceFromCSPHeader());
      } else {
        return getNonceFromCSPHeader();
      }
    }
    return Promise.resolve('');
  }

  const propsWithEnvs = mergeNextClerkPropsWithEnv({
    ...rest,
  });

  let output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={await generateNonce()}
      initialState={await generateStatePromise()}
    >
      {children}
    </ClientClerkProvider>
  );

  const shouldRunAsKeyless = !propsWithEnvs.publishableKey && canUseKeyless__server;

  if (shouldRunAsKeyless) {
    // NOTE: Create or read keys on every render. Usually this means only on hard refresh or hard navigations.
    const newOrReadKeys = await import('../../server/keyless-node.js').then(mod => mod.createOrReadKeyless());

    if (newOrReadKeys) {
      const KeylessCookieSync = await import('../client/keyless-cookie-sync.js').then(mod => mod.KeylessCookieSync);
      output = (
        <KeylessCookieSync {...newOrReadKeys}>
          <ClientClerkProvider
            {...mergeNextClerkPropsWithEnv({
              ...rest,
              publishableKey: newOrReadKeys.publishableKey,
              __internal_claimKeylessApplicationUrl: newOrReadKeys.claimUrl,
              __internal_copyInstanceKeysUrl: newOrReadKeys.apiKeysUrl,
            })}
            nonce={await generateNonce()}
            initialState={await generateStatePromise()}
          >
            {children}
          </ClientClerkProvider>
        </KeylessCookieSync>
      );
    }
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
