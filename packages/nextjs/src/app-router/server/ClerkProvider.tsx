import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import { createClerkClientWithOptions } from '../../server/createClerkClient';
import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { onlyTry } from '../../utils/only-try';
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

    const newOrReadKeys = await import('../../server/keyless-node.js')
      .then(mod => mod.createOrReadKeyless())
      .catch(() => null);
    const { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } = await import(
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
            // Explicitly use `null` instead of `undefined` here to avoid persisting `deleteKeylessAction` during merging of options.
            __internal_keyless_dismissPrompt: runningWithClaimedKeys ? deleteKeylessAction : null,
          })}
          nonce={await generateNonce()}
          initialState={await generateStatePromise()}
        >
          {children}
        </ClientClerkProvider>
      );

      if (runningWithClaimedKeys) {
        try {
          const secretKey = await import('../../server/keyless-node.js').then(
            mod => mod.safeParseClerkFile()?.secretKey,
          );
          if (!secretKey) {
            // we will ignore it later
            throw new Error(secretKey);
          }
          const client = createClerkClientWithOptions({
            secretKey,
          });

          /**
           * Notifying the dashboard the should runs once. We are controlling this behaviour by caching the result of the request.
           * If the request fails, it will be considered stale after 10 minutes, otherwise it is cached for 24 hours.
           */
          await clerkDevelopmentCache?.run(
            () => client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding(),
            {
              cacheKey: `${newOrReadKeys.publishableKey}_complete`,
              onSuccessStale: 24 * 60 * 60 * 1000, // 24 hours
            },
          );
        } catch {
          // ignore
        }

        /**
         * Notify developers.
         */
        clerkDevelopmentCache?.log({
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
        clerkDevelopmentCache?.log({
          cacheKey: newOrReadKeys.publishableKey,
          msg: createKeylessModeMessage({ ...newOrReadKeys, claimUrl: claimUrl.href }),
        });

        output = <KeylessCookieSync {...newOrReadKeys}>{clientProvider}</KeylessCookieSync>;
      }
    } else {
      // When case keyless should run, but keys are not available, then fallback to throwing for missing keys
      output = (
        <ClientClerkProvider
          {...mergeNextClerkPropsWithEnv(rest)}
          nonce={await generateNonce()}
          initialState={await generateStatePromise()}
          disableKeyless
        >
          {children}
        </ClientClerkProvider>
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
