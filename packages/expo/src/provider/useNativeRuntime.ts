import type { Clerk } from '@clerk/clerk-js';
import { useLayoutEffect } from 'react';

import type { TokenCache } from '../cache/types';
import { ClerkExpoModule } from '../utils/native-module';
import { connectNativeRuntime, supportsNativeRuntime } from './nativeRuntime';
import type { getClerkInstance } from './singleton';

const connections = new Map<string, Promise<void>>();
let connectionWork: Promise<unknown> = Promise.resolve();

export async function waitForNativeRuntime(clerk: { publishableKey: string }): Promise<void> {
  const connection = connections.get(clerk.publishableKey);
  if (!connection) {
    throw new Error('Native Clerk components require a development build with the shared runtime adapter.');
  }
  await connection;
  if (connections.get(clerk.publishableKey) !== connection) {
    throw new Error('The native runtime connection has been replaced.');
  }
}

export function useNativeRuntime({
  clerk,
  publishableKey,
  tokenCache,
  enabled,
}: {
  clerk: ReturnType<typeof getClerkInstance> | null;
  publishableKey: string;
  tokenCache?: TokenCache;
  enabled: boolean;
}) {
  useLayoutEffect(() => {
    if (!enabled || !clerk || !ClerkExpoModule) {
      return;
    }
    if (!supportsNativeRuntime()) {
      if (__DEV__) {
        console.warn(
          '[ClerkProvider] Rebuild your native app with the shared Clerk runtime adapter to use native components.',
        );
      }
      return;
    }
    let current = true;
    let dispose: (() => Promise<void>) | undefined;
    const controller = new AbortController();
    const connection = (async () => {
      await waitForLoad(clerk as Clerk, controller.signal);
      if (!current) {
        return;
      }
      const previous = connectionWork;
      const work = previous
        .catch(() => undefined)
        .then(async () => {
          if (!current) {
            return;
          }
          dispose = await connectNativeRuntime(clerk as Clerk, publishableKey, tokenCache, () => current);
        });
      connectionWork = work;
      await work;
    })();
    connections.set(clerk.publishableKey, connection);
    void connection.catch(error => {
      if (current && __DEV__) {
        console.error('[ClerkProvider] Native runtime configuration failed:', error);
      }
    });
    return () => {
      current = false;
      controller.abort();
      if (connections.get(clerk.publishableKey) === connection) {
        connections.delete(clerk.publishableKey);
      }
      const cleanup = connection.catch(() => undefined).then(() => dispose?.());
      connectionWork = cleanup;
      void cleanup.catch(error => {
        if (__DEV__) {
          console.warn('[ClerkProvider] Native runtime disposal failed:', error);
        }
      });
    };
  }, [clerk, publishableKey, tokenCache, enabled]);
}

function waitForLoad(clerk: Clerk, signal: AbortSignal): Promise<void> {
  if (clerk.loaded) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const finish = () => {
      clerk.off('status', onStatus);
      signal.removeEventListener('abort', onAbort);
    };
    const onStatus = () => {
      if (clerk.loaded) {
        finish();
        resolve();
      }
    };
    const onAbort = () => {
      finish();
      reject(new Error('The native runtime configuration was disposed'));
    };
    clerk.on('status', onStatus);
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) {
      onAbort();
    } else {
      onStatus();
    }
  });
}
