import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../../constants';
import { FakeClerkServer, type NativeSyncHarness, renderWithNativeSync } from './index';

vi.mock('../../../polyfills', () => ({}));

vi.mock('react-native', () => ({
  NativeModules: { BlobModule: {} },
  Platform: { OS: 'ios', constants: { reactNativeVersion: { major: 0, minor: 81, patch: 0 } } },
}));

vi.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  deleteItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
}));

vi.mock('../../../utils/runtime', () => ({
  isNative: () => true,
  isWeb: () => false,
}));

vi.mock('@clerk/react/internal', async () => {
  const { LoadingClerkProvider } = await import('./environment');
  return { InternalClerkProvider: LoadingClerkProvider };
});

vi.mock('../../singleton', async () => {
  const { getClerkInstanceForActiveEnvironment } = await import('./environment');
  return { getClerkInstance: getClerkInstanceForActiveEnvironment };
});

vi.mock('../../../specs/NativeClerkModule', async () => {
  const { activeEnvironment } = await import('./environment');
  return {
    get default() {
      return activeEnvironment().nativeModule;
    },
  };
});

let harness: NativeSyncHarness | undefined;

async function start(...args: Parameters<typeof renderWithNativeSync>): Promise<NativeSyncHarness> {
  harness = await renderWithNativeSync(...args);
  return harness;
}

afterEach(() => {
  harness?.unmount();
  harness = undefined;
});

function seedDevice(users: string[] = ['user_1'], activeUser?: string) {
  const server = new FakeClerkServer();
  return { server, ...server.seedClient({ users, activeUser }) };
}

function signedOutEmissionsSince(h: NativeSyncHarness, emissionIndex: number) {
  return h.js.emissions.slice(emissionIndex).filter(emission => emission.sessionId === null);
}

/** Both SDKs authenticate with the same device token and agree on the client's sessions. */
async function expectConverged(h: NativeSyncHarness): Promise<void> {
  await waitFor(async () => {
    const jsDeviceToken = await h.jsDeviceToken();
    expect(h.native.token).toBe(jsDeviceToken);
    expect(h.server.clientIdForToken(h.native.token)).toBe(h.js.client?.id || null);
    expect(h.native.sessionIds).toEqual(h.js.client?.signedInSessions.map(session => session.id) ?? []);
    expect(h.native.activeSessionId).toBe(h.js.session?.id ?? null);
  });
}

describe('native client sync behavior', () => {
  describe('native-originated changes', () => {
    it('signs JS in with the session a native sign-in created', async () => {
      const h = await start();

      const sessionId = await h.run(() => h.native.signIn('user_1'));

      await waitFor(() => expect(h.js.session?.id).toBe(sessionId));
      await expectConverged(h);
    });

    it('switches the JS active session when native switches sessions, without a signed-out emission', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      expect(h.js.session?.id).toBe(sessionIds.user_1);
      const emissionIndex = h.js.emissions.length;

      await h.run(() => h.native.setActiveSession(sessionIds.user_2));

      await waitFor(() => expect(h.js.session?.id).toBe(sessionIds.user_2));
      await h.settle();
      expect(h.js.session?.id).toBe(sessionIds.user_2);
      expect(signedOutEmissionsSince(h, emissionIndex)).toEqual([]);
      await expectConverged(h);
    });

    it('keeps the remaining session active in JS when native signs out of the active one', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const emissionIndex = h.js.emissions.length;

      await h.run(() => h.native.signOutSession(sessionIds.user_1));

      await waitFor(() => {
        expect(h.js.session?.id).toBe(sessionIds.user_2);
        expect(h.js.client?.signedInSessions.map(session => session.id)).toEqual([sessionIds.user_2]);
      });
      await h.settle();
      expect(signedOutEmissionsSince(h, emissionIndex)).toEqual([]);
      await expectConverged(h);
    });

    it('keeps the remaining session when a JS request is rejected for the removed session before native reports the change', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const emissionIndex = h.js.emissions.length;

      h.native.holdChangeNotifications();
      await h.run(() => h.native.signOutSession(sessionIds.user_1));
      await h.run(() => h.js.getSessionToken());

      await waitFor(() => expect(h.js.session?.id).toBe(sessionIds.user_2));

      await h.run(() => h.native.releaseChangeNotifications());
      await h.settle();
      expect(h.js.session?.id).toBe(sessionIds.user_2);
      expect(signedOutEmissionsSince(h, emissionIndex)).toEqual([]);
      await expectConverged(h);
    });

    it('signs JS out when native signs out of the only session', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      await h.run(() => h.native.signOut());

      await waitFor(() => expect(h.js.session).toBeNull());
      expect(await h.jsDeviceToken()).toBe(token);
      await expectConverged(h);
    });

    it('follows native onto a new client when native replaces the shared device token', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      await h.run(() => h.native.switchToForeignSessionlessClient());
      await h.settle();

      expect(h.native.token).not.toBe(token);
      expect(h.js.client?.id).toBe(server.clientIdForToken(h.native.token));
      expect(h.js.session).toBeNull();
      await expectConverged(h);
    });

    it('moves JS to the rotated device token when native rotates it', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const emissionIndex = h.js.emissions.length;

      await h.run(() => h.native.rotateDeviceToken());
      expect(h.native.token).not.toBe(token);

      await waitFor(async () => expect(await h.jsDeviceToken()).toBe(h.native.token));
      expect(h.js.session?.id).toBe(sessionIds.user_1);
      expect(signedOutEmissionsSince(h, emissionIndex)).toEqual([]);
      await expectConverged(h);
    });

    it('signs JS out when a JS request is rejected after native removed the only session', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      h.native.holdChangeNotifications();
      await h.run(() => h.native.signOut());
      await h.run(() => h.js.getSessionToken());

      expect(h.js.session).toBeNull();
      expect(h.js.client?.signedInSessions).toEqual([]);
      await h.run(() => h.native.releaseChangeNotifications());
      await expectConverged(h);
    });

    it('refetches the JS client a bounded number of times for a burst of rejected requests', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const jsClientFetchesBefore = server.requestCount('js', 'GET /client');

      h.native.holdChangeNotifications();
      await h.run(() => h.native.signOutSession(sessionIds.user_1));
      await h.run(() => Promise.all(Array.from({ length: 5 }, () => h.js.getSessionToken())));

      expect(h.js.session?.id).toBe(sessionIds.user_2);
      expect(server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBeLessThanOrEqual(2);
      await h.run(() => h.native.releaseChangeNotifications());
      await expectConverged(h);
    });

    it('settles a native change without an echo loop', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const jsClientFetchesBefore = server.requestCount('js', 'GET /client');
      const nativeRefreshesBefore = h.native.clientRefreshCount;

      await h.run(() => h.native.setActiveSession(sessionIds.user_2));
      await waitFor(() => expect(h.js.session?.id).toBe(sessionIds.user_2));
      await h.settle();

      await expectConverged(h);
      expect(server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBe(1);
      expect(h.native.clientRefreshCount - nativeRefreshesBefore).toBe(0);
    });
  });

  describe('JS-originated changes', () => {
    it('refreshes native onto the same token and signed-in client after a JS sign-in', async () => {
      const h = await start();

      const sessionId = await h.run(() => h.js.signIn('user_1'));

      await waitFor(() => expect(h.native.activeSessionId).toBe(sessionId));
      await expectConverged(h);
    });

    it('refreshes native to the signed-out client after a JS sign-out', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      await h.run(() => h.js.signOut());

      await waitFor(() => expect(h.native.sessionIds).toEqual([]));
      expect(h.js.session).toBeNull();
      expect(h.native.token).toBe(token);
      await expectConverged(h);
    });

    it('moves the native active session after JS switches sessions with setActive', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      await h.run(() => h.js.setActive({ session: sessionIds.user_2 }));

      await waitFor(() => expect(h.native.activeSessionId).toBe(sessionIds.user_2));
      await expectConverged(h);
    });

    it('moves native to the rotated device token when a JS response rotates it', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.rotateTokenOnNextResponse(token);
      await h.run(() => h.js.updateProfile());
      const rotatedToken = await h.jsDeviceToken();
      expect(rotatedToken).not.toBe(token);

      await waitFor(() => expect(h.native.token).toBe(rotatedToken));
      await expectConverged(h);
    });

    it('coalesces a burst of JS client changes into a bounded number of native refreshes', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const refreshesBefore = h.native.clientRefreshCount;

      await h.run(() => Promise.all(Array.from({ length: 10 }, () => h.js.updateProfile())));
      await h.settle();

      await waitFor(() => expect(h.native.client?.sessions[0]?.profileVersion).toBe(10));
      expect(h.native.clientRefreshCount - refreshesBefore).toBeLessThanOrEqual(3);
      await expectConverged(h);
    });

    it('surfaces a failed native refresh through the sync barrier until a later refresh succeeds', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const failure = new Error('native refresh failed');

      h.native.failNextClientRefresh(failure);
      await h.run(() => h.js.updateProfile());
      await expect(h.run(() => h.awaitJsToNativeSync())).rejects.toBe(failure);

      await h.run(() => h.js.updateProfile());
      await expect(h.run(() => h.awaitJsToNativeSync())).resolves.toBeUndefined();
      await expectConverged(h);
    });

    it('settles a JS change without an echo loop', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const jsClientFetchesBefore = server.requestCount('js', 'GET /client');
      const nativeRefreshesBefore = h.native.clientRefreshCount;

      await h.run(() => h.js.setActive({ session: sessionIds.user_2 }));
      await h.settle();

      await expectConverged(h);
      expect(server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBeLessThanOrEqual(1);
      expect(h.native.clientRefreshCount - nativeRefreshesBefore).toBe(1);
    });
  });

  describe('startup', () => {
    it('signs JS in from the native device token when the default in-memory JS cache is empty', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);

      const h = await start({ server, nativeDeviceToken: token });

      await waitFor(() => expect(h.js.session?.id).toBe(sessionIds.user_1));
      expect(await h.jsDeviceToken()).toBe(token);
      await expectConverged(h);
    });

    it('moves native onto the JS device token when native has none', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);

      const h = await start({ server, jsDeviceToken: token });

      expect(h.js.session?.id).toBe(sessionIds.user_1);
      await waitFor(() => expect(h.native.token).toBe(token));
      await waitFor(() => expect(h.native.activeSessionId).toBe(sessionIds.user_1));
      await expectConverged(h);
    });

    it('configures native once when ClerkProvider mounts under StrictMode', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);

      const h = await start({ server, jsDeviceToken: token, strictMode: true });

      expect(h.nativeModuleCalls.filter(call => call === 'configureNative')).toHaveLength(1);
      expect(h.js.session?.id).toBe(sessionIds.user_1);
      await expectConverged(h);
    });

    it('keeps JS working on its own token cache with sync disabled when native fails to configure', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token, failNativeConfigure: true });

      expect(h.js.session?.id).toBe(sessionIds.user_1);
      server.rotateTokenOnNextResponse(token);
      await h.run(() => h.js.updateProfile());
      await h.settle();

      const rotatedToken = h.persistentTokenCache?.read(CLERK_CLIENT_JWT_KEY) ?? null;
      expect(rotatedToken).not.toBe(token);
      expect(await h.jsDeviceToken()).toBe(rotatedToken);
      expect(h.native.token).toBe(token);
      expect(h.nativeModuleCalls.filter(call => call !== 'configureNative' && call !== 'addListener')).toEqual([]);
      await expect(h.run(() => h.awaitJsToNativeSync())).resolves.toBeUndefined();
    });

    it('mirrors the shared device token into the app token cache', async () => {
      const server = new FakeClerkServer();
      const stale = server.seedClient();
      const signedIn = server.seedClient({ users: ['user_1'] });

      const h = await start({ server, jsDeviceToken: stale.token, nativeDeviceToken: signedIn.token });
      server.rotateTokenOnNextResponse(signedIn.token);
      await h.run(() => h.js.updateProfile());

      await waitFor(() => expect(h.persistentTokenCache?.read(CLERK_CLIENT_JWT_KEY)).toBe(h.native.token));
      expect(h.native.token).not.toBe(signedIn.token);
    });

    it('delivers a JS sign-in that happens while native is still starting up', async () => {
      const h = await start({ delayNativeStartup: true });

      const sessionId = await h.run(() => h.js.signIn('user_1'));
      await h.run(() => h.releaseNativeStartup());

      await waitFor(() => expect(h.native.activeSessionId).toBe(sessionId));
      await expectConverged(h);
    });
  });

  describe('explicit synchronization barrier (biometric flows)', () => {
    it('lets a native operation observe the latest JS state and JS observe the native result', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      await h.run(async () => {
        await h.js.setActive({ session: sessionIds.user_2 });
        await h.awaitJsToNativeSync();
      });
      expect(h.native.activeSessionId).toBe(sessionIds.user_2);

      h.native.holdChangeNotifications();
      await h.run(async () => {
        await h.native.setActiveSession(sessionIds.user_1);
        await h.pullNativeToJs();
      });
      expect(h.js.session?.id).toBe(sessionIds.user_1);

      await h.run(() => h.native.releaseChangeNotifications());
      await h.settle();
      expect(h.js.session?.id).toBe(sessionIds.user_1);
      await expectConverged(h);
    });

    it('lets JS observe a session created by a native sign-in once the pull resolves', async () => {
      const h = await start();

      await h.run(() => h.awaitJsToNativeSync());
      h.native.holdChangeNotifications();
      const sessionId = await h.run(async () => {
        const createdSessionId = await h.native.signIn('user_1');
        await h.pullNativeToJs();
        return createdSessionId;
      });

      expect(h.js.client?.signedInSessions.map(session => session.id)).toContain(sessionId);
      expect(h.js.session?.id).toBe(sessionId);
    });

    it('rejects with environment_unavailable when native does not finish a refresh in time', async () => {
      const h = await start({ delayNativeStartup: true });
      await h.run(() => h.js.signIn('user_1'));

      vi.useFakeTimers();
      try {
        const barrier = expect(h.awaitJsToNativeSync()).rejects.toMatchObject({ code: 'environment_unavailable' });
        await vi.advanceTimersByTimeAsync(5_000);
        await barrier;
      } finally {
        vi.useRealTimers();
      }

      await h.run(() => h.releaseNativeStartup());
      await expect(h.run(() => h.awaitJsToNativeSync())).resolves.toBeUndefined();
      await expectConverged(h);
    });
  });

  describe('without native client sync', () => {
    it.each([
      ['sync is disabled', { disableNativeClientSync: true }],
      ['the native module is absent', { nativeModule: 'absent' as const }],
    ])('makes no native calls and persists the JS device token in the token cache when %s', async (_, scenario) => {
      const h = await start({ persistentTokenCache: true, ...scenario });

      const sessionId = await h.run(() => h.js.signIn('user_1'));
      await h.settle();

      expect(h.js.session?.id).toBe(sessionId);
      const cachedToken = h.persistentTokenCache?.read(CLERK_CLIENT_JWT_KEY) ?? null;
      expect(h.server.clientIdForToken(cachedToken)).toBe(h.js.client?.id);
      expect(h.nativeModuleCalls).toEqual([]);
      expect(h.native.token).toBeNull();
    });
  });

  describe('shared device token', () => {
    it('keeps the native signed-in session when JS starts with a stale device token', async () => {
      const server = new FakeClerkServer();
      const stale = server.seedClient();
      const signedIn = server.seedClient({ users: ['user_1'] });

      const h = await start({ server, jsDeviceToken: stale.token, nativeDeviceToken: signedIn.token });

      await waitFor(() => expect(h.js.session?.id).toBe(signedIn.sessionIds.user_1));
      await expectConverged(h);
    });

    it('converges on one device token when JS and native rotate it at the same time', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.rotateTokenOnNextResponse(token);
      await h.run(() => Promise.all([h.native.rotateDeviceToken(), h.js.updateProfile()]));
      await h.settle();

      expect(await h.jsDeviceToken()).not.toBe(token);
      expect(h.js.session?.id).toBe(sessionIds.user_1);
      await expectConverged(h);
    });
  });
});
