import { act, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../../constants';
import type { NativeClientSnapshot } from '../../../hooks/useNativeClientEvents';
import type { ClerkExpoNativeModule } from '../../../utils/native-module';
import { FakePersistentTokenCache, setActiveEnvironment } from './environment';
import { FakeClerk } from './fakeClerk';
import { FakeNativeClerk } from './fakeNativeClerk';
import { FakeClerkServer } from './fakeServer';
import type { NativeSyncHarness, RenderWithNativeSync } from './harness';

const nativeClientChangedEvent = 'clerkNativeClientChanged';

function serializeClient(native: FakeNativeClerk): string {
  return JSON.stringify(native.client);
}

/**
 * Today's `ClerkExpo` native module contract, modeled on the iOS bridge: `configure` adopts a bearer
 * token, `syncClientStateFromJs` adopts/refreshes and echoes a change tagged with the JS `sourceId`, and
 * native-originated changes are emitted as `clerkNativeClientChanged` snapshots.
 */
function createCurrentNativeModule(native: FakeNativeClerk, calls: string[]): ClerkExpoNativeModule {
  const listeners = new Set<(snapshot: NativeClientSnapshot) => void>();

  native.onChange((change, origin) => {
    const snapshot: NativeClientSnapshot = {
      changed: { client: change.client, deviceToken: change.deviceToken },
      deviceToken: native.token,
      ...(origin.kind === 'js' && origin.tag ? { sourceId: origin.tag } : {}),
    };
    for (const listener of [...listeners]) {
      listener(snapshot);
    }
  });

  return {
    addListener: (eventName: string, listener?: (...args: unknown[]) => void) => {
      calls.push('addListener');
      if (eventName !== nativeClientChangedEvent || !listener) {
        return { remove: () => undefined };
      }
      const typedListener = listener as (snapshot: NativeClientSnapshot) => void;
      listeners.add(typedListener);
      return { remove: () => listeners.delete(typedListener) };
    },
    configure: async (_publishableKey: string, bearerToken: string | null) => {
      calls.push('configure');
      await native.waitForStartup();
      if (bearerToken && (bearerToken !== native.token || !native.client)) {
        await native.adoptToken(bearerToken);
      } else {
        await native.refreshClient();
      }
      native.isConfigured = true;
    },
    getClientToken: () => {
      calls.push('getClientToken');
      return Promise.resolve(native.token);
    },
    syncClientStateFromJs: async (
      deviceToken: string | null,
      sourceId: string | null,
      didChangeClient: boolean,
      didChangeDeviceToken: boolean,
    ) => {
      calls.push('syncClientStateFromJs');
      if (!native.isConfigured) {
        return;
      }
      const previousToken = native.token;
      const previousClient = serializeClient(native);
      const changeSincePrevious = () => ({
        client: serializeClient(native) !== previousClient,
        deviceToken: native.token !== previousToken,
      });
      try {
        if (didChangeDeviceToken && deviceToken && deviceToken !== native.token) {
          await native.adoptToken(deviceToken);
        } else if (didChangeClient || didChangeDeviceToken) {
          await native.refreshClient();
        }
      } catch (error) {
        const change = changeSincePrevious();
        if (change.client || change.deviceToken) {
          native.emitChange(change, { kind: 'native' });
        }
        throw error;
      }
      native.emitChange(changeSincePrevious(), { kind: 'js', tag: sourceId });
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
    nativeModule: scenario.nativeModule === 'absent' ? null : createCurrentNativeModule(native, nativeModuleCalls),
  });

  // Fresh engine modules per scenario: the native module is resolved at import time and the
  // coordinator and default in-memory token cache are module singletons.
  vi.resetModules();
  const { ClerkProvider } = await import('../../ClerkProvider');
  const { synchronizeNativeClientToJs, waitForPendingJsToNativeSync } =
    await import('../../nativeClientSyncCoordinator');

  const view = render(
    <ClerkProvider
      publishableKey='pk_test_native_client_sync_behavior'
      tokenCache={persistentTokenCache ?? undefined}
      __experimental_disableNativeClientSync={scenario.disableNativeClientSync}
    />,
  );

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
    awaitJsToNativeSync: () => waitForPendingJsToNativeSync(),
    pullNativeToJs: () => synchronizeNativeClientToJs(),
    releaseNativeStartup,
    unmount: () => view.unmount(),
  };
  return harness;
};
