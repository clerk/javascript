import type { AuthObject } from '@clerk/backend';
import type { Without } from '@clerk/types';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { createClerkClientWithOptions } from '../../server/createClerkClient';
import { collectKeylessMetadata, formatMetadataHeaders } from '../../server/keyless-custom-headers';
import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { onlyTry } from '../../utils/only-try';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { deleteKeylessAction } from '../keyless-actions';

export async function getKeylessStatus(
  params: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>,
) {
  let [shouldRunAsKeyless, runningWithClaimedKeys, locallyStoredPublishableKey] = [false, false, ''];
  if (canUseKeyless) {
    locallyStoredPublishableKey = await import('../../server/keyless-node.js')
      .then(mod => mod.safeParseClerkFile()?.publishableKey || '')
      .catch(() => '');

    runningWithClaimedKeys = Boolean(params.publishableKey) && params.publishableKey === locallyStoredPublishableKey;
    shouldRunAsKeyless = !params.publishableKey || runningWithClaimedKeys;
  }

  return {
    shouldRunAsKeyless,
    runningWithClaimedKeys,
  };
}

type KeylessProviderProps = PropsWithChildren<{
  rest: Without<NextClerkProviderProps, '__unstable_invokeMiddlewareOnAuthStateChange'>;
  runningWithClaimedKeys: boolean;
  generateStatePromise: () => Promise<AuthObject | null>;
  generateNonce: () => Promise<string>;
  signalForSync: boolean;
}>;

export const KeylessProvider = async (props: KeylessProviderProps) => {
  const { rest, runningWithClaimedKeys, generateNonce, generateStatePromise, children, signalForSync } = props;

  // NOTE: Create or read keys on every render. Usually this means only on hard refresh or hard navigations.
  const newOrReadKeys = await import('../../server/keyless-node.js')
    .then(mod => mod.createOrReadKeyless())
    .catch(() => null);

  const { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } = await import(
    '../../server/keyless-log-cache.js'
  );

  if (!newOrReadKeys) {
    // When case keyless should run, but keys are not available, then fallback to throwing for missing keys
    return (
      <ClientClerkProvider
        {...mergeNextClerkPropsWithEnv(rest)}
        nonce={await generateNonce()}
        initialState={await generateStatePromise()}
        disableKeyless
        signalForSync={signalForSync}
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
      signalForSync={signalForSync}
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

      // Collect metadata
      const keylessHeaders = await collectKeylessMetadata()
        .then(formatMetadataHeaders)
        .catch(() => new Headers());

      /**
       * Notifying the dashboard the should runs once. We are controlling this behaviour by caching the result of the request.
       * If the request fails, it will be considered stale after 10 minutes, otherwise it is cached for 24 hours.
       */
      await clerkDevelopmentCache?.run(
        () =>
          client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
            requestHeaders: keylessHeaders,
          }),
        {
          cacheKey: `${newOrReadKeys.publishableKey}_complete`,
          onSuccessStale: 24 * 60 * 60 * 1000, // 24 hours
        },
      );
    } catch {
      // noop
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
