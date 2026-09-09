import type { Clerk } from '@clerk/shared/types';

import { attachResourceCore } from '../generated/attached-core';
import type { NativeResourceModule } from '../specs/NativeClerkModule.types';
import { invalidateMobileCredentials } from './singleton/createClerkInstance';

const connections = new WeakMap<object, { ready: Promise<void> }>();
export function waitForNativeResources(clerk: object): Promise<void> {
  return (
    connections.get(clerk)?.ready ??
    Promise.reject(
      Object.assign(new Error('Native Clerk resources are not available.'), { code: 'environment_unavailable' }),
    )
  );
}

/** Owns only the native projection and OS effects; Clerk remains the Expo singleton. */
export function connectNativeResources(clerk: Clerk, native: NativeResourceModule) {
  let connection: { ready: Promise<void> } | undefined;
  let notifyClosed!: () => void;
  const closed = new Promise<void>(resolve => {
    notifyClosed = resolve;
  });
  let disposed = false;
  let connectionId: string | undefined;
  let projection: ReturnType<typeof attachResourceCore> | undefined;
  let removeHost: (() => void) | undefined;
  let subscription: { remove(): void } | undefined;
  let requestSequence = 0;
  const pending = new Map<string, { capability: string; reject(error: Error): void }>();
  const error = (code: string) => Object.assign(new Error('The native Clerk connection is unavailable.'), { code });
  const cancel = (authenticationOnly: boolean) => {
    const ids: string[] = [];
    for (const [id, request] of pending) {
      if (
        authenticationOnly &&
        !['browser', 'passkeys.get', 'passkeys.create', 'appleIdentity', 'googleIdentity', 'biometrics.sign'].includes(
          request.capability,
        )
      )
        continue;
      pending.delete(id);
      ids.push(id);
      request.reject(error(authenticationOnly ? 'stale_authentication_attempt' : 'native_host_unavailable'));
    }
    if (connectionId && ids.length) native.cancelCoreCapabilities(connectionId, ids);
  };
  function dispose() {
    if (disposed) return;
    disposed = true;
    notifyClosed();
    if (connections.get(clerk) === connection) connections.delete(clerk);
    projection?.dispose();
    removeHost?.();
    cancel(false);
    subscription?.remove();
    if (connectionId) native.detachCore(connectionId);
  }
  const ready = (async () => {
    if (!clerk.__internal_configureNativeHost) throw error('incompatible_clerk_core');
    const configuration = await native.prepareCore(clerk.publishableKey);
    connectionId = configuration.connectionId;
    if (disposed) {
      native.detachCore(connectionId);
      return;
    }
    subscription = native.addListener('clerkCoreMessage', value => {
      if (disposed || value.connectionId !== connectionId) return;
      try {
        if (JSON.parse(value.message).kind === 'dispose') {
          dispose();
          return;
        }
      } catch {
        dispose();
        return;
      }
      projection?.receive(value.message);
    });
    const host = await clerk.__internal_configureNativeHost({
      ...configuration,
      request: (capability, args) => {
        if (disposed) return Promise.reject(error('native_host_unavailable'));
        const id = `${++requestSequence}`;
        return new Promise((resolve, reject) => {
          pending.set(id, { capability, reject });
          void native.performCoreCapability(configuration.connectionId, id, capability, JSON.stringify(args)).then(
            result => {
              if (!pending.delete(id)) return;
              try {
                resolve(JSON.parse(result));
              } catch {
                reject(error('invalid_native_result'));
              }
            },
            cause => {
              if (pending.delete(id)) reject(cause);
            },
          );
        });
      },
      cancelAuthentication: () => cancel(true),
      invalidateCredentials: () => invalidateMobileCredentials(clerk),
    });
    if (disposed) {
      host();
      return;
    }
    removeHost = host;
    projection = attachResourceCore(
      clerk,
      message => {
        if (!disposed) native.receiveCoreMessage(configuration.connectionId, JSON.stringify(message));
      },
      { namespace: configuration.connectionId },
    );
    await native.startCore(configuration.connectionId);
  })().catch(cause => {
    dispose();
    throw cause;
  });
  connection = { ready };
  connections.set(clerk, connection);
  return { ready, closed, dispose };
}
