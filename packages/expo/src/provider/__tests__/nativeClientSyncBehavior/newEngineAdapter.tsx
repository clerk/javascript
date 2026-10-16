import { act, render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../../constants';
import type { ClerkExpoNativeModule } from '../../../utils/native-module';
import { FakePersistentTokenCache, setActiveEnvironment } from './environment';
import { FakeClerk } from './fakeClerk';
import { FakeNativeClerk } from './fakeNativeClerk';
import { FakeClerkServer } from './fakeServer';
import type { NativeSyncHarness, RenderWithNativeSync } from './harness';

const nativeClientInvalidatedEvent = 'clerkNativeClientInvalidated';

/**
 * The `ClerkExpo` native module contract of the simplified engine: native storage owns the device token,
 * `configureNative` keeps native's own token and only adopts the seed when it has none, `setDeviceToken` is a
 * compare-and-set, and any change to native's client or token is signalled without a payload.
 */
function createNativeModule(
  native: FakeNativeClerk,
  calls: string[],
  { failConfigure }: { failConfigure: boolean },
): ClerkExpoNativeModule {
  const listeners = new Set<() => void>();
  native.onChange(() => {
    for (const listener of [...listeners]) {
      listener();
    }
  });

  const notifyIfChanged = async (change: () => Promise<void> | void) => {
    const previousToken = native.token;
    const previousClient = JSON.stringify(native.client);
    await change();
    const changed = {
      client: JSON.stringify(native.client) !== previousClient,
      deviceToken: native.token !== previousToken,
    };
    if (changed.client || changed.deviceToken) {
      native.emitChange(changed, { kind: 'native' });
    }
  };

  return {
    addListener: (eventName, listener) => {
      calls.push('addListener');
      if (eventName !== nativeClientInvalidatedEvent || !listener) {
        return { remove: () => undefined };
      }
      const invalidated = () => listener();
      listeners.add(invalidated);
      return { remove: () => listeners.delete(invalidated) };
    },
    configureNative: (_publishableKey, seedDeviceToken) => {
      calls.push('configureNative');
      if (failConfigure) {
        return Promise.reject(new Error('native configure failed'));
      }
      native.token ??= seedDeviceToken;
      native.isConfigured = true;
      return Promise.resolve();
    },
    getDeviceToken: () => {
      calls.push('getDeviceToken');
      return Promise.resolve(native.token);
    },
    setDeviceToken: async (token, expected) => {
      calls.push('setDeviceToken');
      if (native.token !== expected) {
        return false;
      }
      await notifyIfChanged(() => {
        native.token = token;
      });
      return true;
    },
    refreshClient: async () => {
      calls.push('refreshClient');
      await native.waitForStartup();
      await notifyIfChanged(() => native.refreshClient());
    },
  };
}

async function flushMacrotasks(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

export const renderWithNativeSync: RenderWithNativeSync = async (scenario = {}) => {
  const server = scenario.server ?? new FakeClerkServer();
  const native = new FakeNativeClerk(server, scenario.nativeDeviceToken ?? null);
  const js = new FakeClerk(server);
  const persistentTokenCache =
    scenario.persistentTokenCache || scenario.jsDeviceToken !== undefined
      ? new FakePersistentTokenCache(scenario.jsDeviceToken ? { [CLERK_CLIENT_JWT_KEY]: scenario.jsDeviceToken } : {})
      : null;
  const releaseNativeStartup = scenario.delayNativeStartup ? native.delayStartup() : () => undefined;
  const nativeModuleCalls: string[] = [];

  setActiveEnvironment({
    js,
    nativeModule:
      scenario.nativeModule === 'absent'
        ? null
        : createNativeModule(native, nativeModuleCalls, { failConfigure: !!scenario.failNativeConfigure }),
  });

  // Fresh engine modules per scenario: the native module is resolved at import time and the native
  // configuration and active engine are module singletons.
  vi.resetModules();
  const { ClerkProvider } = await import('../../ClerkProvider');
  const { idle, pullFromNative } = await import('../../nativeClientSync');

  const provider = (
    <ClerkProvider
      publishableKey='pk_test_native_client_sync_behavior'
      tokenCache={persistentTokenCache ?? undefined}
      __experimental_disableNativeClientSync={scenario.disableNativeClientSync}
    />
  );
  const view = render(scenario.strictMode ? <StrictMode>{provider}</StrictMode> : provider);

  const settle = async () => {
    for (let round = 0; round < 8; round++) {
      await act(async () => {
        await flushMacrotasks(10);
      });
    }
  };

  await waitFor(() => {
    if (!js.loaded) {
      throw new Error('Clerk has not loaded yet');
    }
  });
  await settle();

  const harness: NativeSyncHarness = {
    server,
    native,
    js,
    persistentTokenCache,
    jsDeviceToken: () => js.currentDeviceToken(),
    nativeModuleCalls,
    run: async action => {
      let result!: Awaited<ReturnType<typeof action>>;
      await act(async () => {
        result = await action();
      });
      return result;
    },
    settle,
    awaitJsToNativeSync: () => idle(),
    pullNativeToJs: () => pullFromNative(),
    releaseNativeStartup,
    unmount: () => view.unmount(),
  };
  return harness;
};
