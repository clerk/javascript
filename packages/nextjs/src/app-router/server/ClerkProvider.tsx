import type { AuthObject } from '@clerk/backend';
import type { InitialState, Without } from '@clerk/types';
import { headers } from 'next/headers';
import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';

import { PromisifiedAuthProvider } from '../../client-boundary/PromisifiedAuthProvider';
import { getDynamicAuthData } from '../../server/buildClerkProps';
import { createClerkClientWithOptions } from '../../server/createClerkClient';
import type { NextClerkProviderProps } from '../../types';
import { createDebugLogger } from '../../utils/debugLogger';
import { canUseKeyless } from '../../utils/feature-flags';
import { logFormatter } from '../../utils/logFormatter';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { isNext13 } from '../../utils/sdk-versions';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { deleteKeylessAction } from '../keyless-actions';
import { buildRequestLike, getScriptNonceFromHeader } from './utils';

const ClerkProviderDebugLogger = createDebugLogger('<ClerkProvider/>', logFormatter)();

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

async function keylessStatus(params: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>) {
  let [shouldRunAsKeyless, runningWithClaimedKeys] = [false, false];
  if (canUseKeyless) {
    const locallyStorePublishableKey = await import('../../server/keyless-node.js')
      .then(mod => mod.safeParseClerkFile()?.publishableKey)
      .catch(() => undefined);

    ClerkProviderDebugLogger.debugOnce('Keyless status', {
      providedPublishableKey: params.publishableKey || '',
      locallyStorePublishableKey: locallyStorePublishableKey || '',
    });

    runningWithClaimedKeys = Boolean(params.publishableKey) && params.publishableKey === locallyStorePublishableKey;
    shouldRunAsKeyless = !params.publishableKey || runningWithClaimedKeys;
  }
  return {
    shouldRunAsKeyless,
    runningWithClaimedKeys,
  };
}

const KeylessProvider = async (
  props: PropsWithChildren<{
    rest: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>;
    runningWithClaimedKeys: boolean;
    generateStatePromise: () => Promise<AuthObject | null>;
    generateNonce: () => Promise<string>;
  }>,
) => {
  const { rest, runningWithClaimedKeys, generateNonce, generateStatePromise, children } = props;

  // NOTE: Create or read keys on every render. Usually this means only on hard refresh or hard navigations.
  const newOrReadKeys = await import('../../server/keyless-node.js')
    .then(mod => mod.createOrReadKeyless())
    .catch(e => {
      ClerkProviderDebugLogger.debugOnce('Failed to createOrReadKeyless', (e as Error).toString());
      return null;
    });

  const { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } = await import(
    '../../server/keyless-log-cache.js'
  );

  if (!newOrReadKeys) {
    // When case keyless should run, but keys are not available, then fallback to throwing for missing keys
    ClerkProviderDebugLogger.debugOnce('Keys not found, mounting `<ClientClerkProvider disableKeyless/>`');
    return (
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
      const secretKey = await import('../../server/keyless-node.js').then(mod => mod.safeParseClerkFile()?.secretKey);
      if (!secretKey) {
        // we will ignore it later
        throw new Error('Missing secret key from `.clerk/`');
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
    } catch (e) {
      ClerkProviderDebugLogger.debugOnce('Failed to createOrReadKeyless', (e as Error).toString());
    }

    /**
     * Notify developers.
     */
    clerkDevelopmentCache?.log({
      cacheKey: `${newOrReadKeys.publishableKey}_claimed`,
      msg: createConfirmationMessage(),
    });

    return clientProvider;
  }

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

  return <KeylessCookieSync {...newOrReadKeys}>{clientProvider}</KeylessCookieSync>;
};

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

  const { shouldRunAsKeyless, runningWithClaimedKeys } = await keylessStatus(propsWithEnvs);
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
