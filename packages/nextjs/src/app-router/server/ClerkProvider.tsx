import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { isNext13 } from '../../utils/sdk-versions';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { deleteKeylessAction } from '../keyless-actions';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const getDynamicClerkState = React.cache(async function getDynamicClerkState() {
  const request = await buildRequestLike();
  const data = getDynamicAuthData(request);

  return data;
});

const getNonceFromCSPHeader = React.cache(async function getNonceFromCSPHeader() {
  return getScriptNonceFromHeader((await headers()).get('Content-Security-Policy') || '') || '';
});

/** Discards errors thrown by attempted code */
const onlyTry = (cb: () => unknown) => {
  try {
    cb();
  } catch {
    // ignore
  }
};

export async function ClerkProvider(
  props: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  const { children, dynamic, ...rest } = props;

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

  let output = (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      nonce={await generateNonce()}
      initialState={await generateStatePromise()}
    >
      {children}
    </ClientClerkProvider>
  );

  let [shouldRunAsKeyless, runningWithClaimedKeys] = [false, false];
  if (canUseKeyless) {
    const locallyStorePublishableKey = await import('../../server/keyless-node.js')
      .then(mod => mod.safeParseClerkFile()?.publishableKey)
      .catch(() => undefined);

    runningWithClaimedKeys =
      Boolean(propsWithEnvs.publishableKey) && propsWithEnvs.publishableKey === locallyStorePublishableKey;
    shouldRunAsKeyless = !propsWithEnvs.publishableKey || runningWithClaimedKeys;
  }

  if (shouldRunAsKeyless) {
    // NOTE: Create or read keys on every render. Usually this means only on hard refresh or hard navigations.

    const newOrReadKeys = await import('../../server/keyless-node.js').then(mod => mod.createOrReadKeyless());
    const { keylessLogger, createConfirmationMessage, createKeylessModeMessage } = await import(
      '../../server/keyless-log-cache.js'
    );

    if (newOrReadKeys) {
      const clientProvider = (
        <ClientClerkProvider
          {...mergeNextClerkPropsWithEnv({
            ...rest,
            publishableKey: newOrReadKeys.publishableKey,
            __internal_keyless_claimKeylessApplicationUrl: newOrReadKeys.claimUrl,
            __internal_keyless_copyInstanceKeysUrl: newOrReadKeys.apiKeysUrl,
            __internal_keyless_dismissPrompt: runningWithClaimedKeys ? deleteKeylessAction : undefined,
          })}
          nonce={await generateNonce()}
          initialState={await generateStatePromise()}
        >
          {children}
        </ClientClerkProvider>
      );

      if (runningWithClaimedKeys) {
        /**
         * Notify developers.
         */
        keylessLogger?.log({
          cacheKey: `${newOrReadKeys.publishableKey}_claimed`,
          msg: createConfirmationMessage(),
        });

        output = clientProvider;
      } else {
        const KeylessCookieSync = await import('../client/keyless-cookie-sync.js').then(mod => mod.KeylessCookieSync);

        const headerStore = await headers();
        /**
         * Allow developer to return to local application after claiming
         */
        const host = headerStore.get('x-forwarded-host');
        const proto = headerStore.get('x-forwarded-proto');

        const claimUrl = new URL(newOrReadKeys.claimUrl);
        if (host && proto) {
          onlyTry(() => claimUrl.searchParams.set('return_url', new URL(`${proto}://${host}`).href));
        }

        /**
         * Notify developers.
         */
        keylessLogger?.log({
          cacheKey: newOrReadKeys.publishableKey,
          msg: createKeylessModeMessage({ ...newOrReadKeys, claimUrl: claimUrl.href }),
        });

        output = <KeylessCookieSync {...newOrReadKeys}>{clientProvider}</KeylessCookieSync>;
      }
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
