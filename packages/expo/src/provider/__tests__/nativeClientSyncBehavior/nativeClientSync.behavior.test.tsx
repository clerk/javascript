import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CLERK_CLIENT_JWT_KEY } from '../../../constants';
import { FakeClerkServer, type NativeSyncHarness, renderWithNativeSync } from './index';

vi.mock('../../../polyfills', () => ({}));

const appState = vi.hoisted(() => {
  const listeners = new Set<(state: string) => void>();
  return {
    currentState: 'active',
    addEventListener: (_event: string, listener: (state: string) => void) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
    moveTo(state: string) {
      this.currentState = state;
      for (const listener of [...listeners]) {
        listener(state);
      }
    },
  };
});

vi.mock('react-native', () => ({
  AppState: appState,
  NativeModules: { BlobModule: {} },
  Platform: { OS: 'ios', constants: { reactNativeVersion: { major: 0, minor: 81, patch: 0 } } },
}));

vi.mock('../../../app-version/appVersionRequestHooks', () => ({
  createAppVersionRequestHooks: () => ({
    checkOnForeground: () => {},
    beforeRequest: () => {},
    afterResponse: () => {},
  }),
}));

vi.mock('../../../update-required/UpdateRequiredModal', () => ({
  UpdateRequiredModal: () => null,
}));

vi.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  deleteItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
}));

vi.mock('../../../utils/runtime', () => ({
  isExpoGo: () => false,
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
  appState.currentState = 'active';
  vi.useRealTimers();
});

async function skipRetryBackoff(h: NativeSyncHarness): Promise<void> {
  await h.run(() => vi.advanceTimersByTimeAsync(10_000));
}

function returnToForeground(h: NativeSyncHarness): Promise<void> {
  return h.run(() => {
    appState.moveTo('background');
    appState.moveTo('active');
  });
}

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

    it('moves JS to the organization native switches to', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      await h.run(() => h.native.setActiveOrganization('org_1'));
      await h.settle();

      expect(h.native.activeOrganizationId).toBe('org_1');
      expect(h.js.session?.lastActiveOrganizationId).toBe('org_1');
      await expectConverged(h);
    });

    it('signs JS in with the session a native sign-in created when the first JS refetch fails', async () => {
      const h = await start();
      vi.useFakeTimers({ shouldAdvanceTime: true });
      h.server.failNextRequests('js', 'GET /client');

      const sessionId = await h.run(() => h.native.signIn('user_1'));
      await skipRetryBackoff(h);

      await waitFor(() => expect(h.js.session?.id).toBe(sessionId));
      await expectConverged(h);
    });

    it('signs JS in when the app returns to the foreground after every JS refetch of a native sign-in failed', async () => {
      const h = await start();
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const jsClientFetchesBefore = h.server.requestCount('js', 'GET /client');
      h.server.failNextRequests('js', 'GET /client', 3);

      const sessionId = await h.run(() => h.native.signIn('user_1'));
      await skipRetryBackoff(h);
      await h.settle();
      expect(h.server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBe(3);
      expect(h.js.session).toBeNull();

      await returnToForeground(h);

      await waitFor(() => expect(h.js.session?.id).toBe(sessionId));
      await expectConverged(h);
      const jsClientFetchesAfterRepair = h.server.requestCount('js', 'GET /client');
      await returnToForeground(h);
      await h.settle();
      expect(h.server.requestCount('js', 'GET /client')).toBe(jsClientFetchesAfterRepair);
    });

    it('stops retrying the JS refetch of a native sign-in once ClerkProvider unmounts', async () => {
      const h = await start();
      vi.useFakeTimers();
      const jsClientFetchesBefore = h.server.requestCount('js', 'GET /client');
      h.server.failNextRequests('js', 'GET /client');

      const signIn = h.native.signIn('user_1');
      await h.run(() => vi.advanceTimersByTimeAsync(100));
      await signIn;
      expect(h.server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBe(1);
      h.unmount();
      harness = undefined;
      await vi.advanceTimersByTimeAsync(10_000);

      expect(h.server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBe(1);
      expect(h.server.requestCount('js', 'POST /client/sessions/:id/touch')).toBe(0);
    });

    it('does not retry a JS refetch of a native sign-in that the server rejected', async () => {
      const h = await start();
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const jsClientFetchesBefore = h.server.requestCount('js', 'GET /client');
      h.server.rejectNextRequest('js', 'GET /client', 429);

      const sessionId = await h.run(() => h.native.signIn('user_1'));
      await skipRetryBackoff(h);
      await h.settle();
      expect(h.server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBe(1);
      expect(h.js.session).toBeNull();

      await returnToForeground(h);

      await waitFor(() => expect(h.js.session?.id).toBe(sessionId));
      await expectConverged(h);
    });

    it('does not refetch the JS client when activating the session of a native sign-in fails', async () => {
      const h = await start();
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const jsClientFetchesBefore = h.server.requestCount('js', 'GET /client');
      h.server.failNextRequests('js', 'POST /client/sessions/:id/touch');

      const sessionId = await h.run(() => h.native.signIn('user_1'));
      await skipRetryBackoff(h);
      await h.settle();
      expect(h.server.requestCount('js', 'GET /client') - jsClientFetchesBefore).toBe(1);
      expect(h.js.session).toBeNull();

      await returnToForeground(h);

      await waitFor(() => expect(h.js.session?.id).toBe(sessionId));
      await expectConverged(h);
    });

    it('sends no JS client request when the app returns to the foreground after JS followed a native sign-in', async () => {
      const h = await start();
      const sessionId = await h.run(() => h.native.signIn('user_1'));
      await waitFor(() => expect(h.js.session?.id).toBe(sessionId));
      await h.settle();
      const jsClientFetchesBefore = h.server.requestCount('js', 'GET /client');

      await returnToForeground(h);
      await h.settle();

      expect(h.server.requestCount('js', 'GET /client')).toBe(jsClientFetchesBefore);
      expect(h.js.session?.id).toBe(sessionId);
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
      expect(h.native.clientRefreshCount - nativeRefreshesBefore).toBe(1);
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

    it('converges after a failed native refresh', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      h.native.failNextClientRefresh(new Error('native refresh failed'));
      await h.run(() => h.js.setActive({ session: sessionIds.user_2 }));
      await h.settle();

      expect(h.native.activeSessionId).toBe(sessionIds.user_2);
      await expectConverged(h);
    });

    it('moves native to the organization JS switches to', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      const refreshesBefore = h.native.clientRefreshCount;

      await h.run(() => h.js.setActive({ organization: 'org_1' }));
      await h.settle();

      expect(h.js.session?.lastActiveOrganizationId).toBe('org_1');
      expect(h.native.activeOrganizationId).toBe('org_1');
      expect(h.native.clientRefreshCount - refreshesBefore).toBe(1);
      await expectConverged(h);
    });

    it('refreshes native for a profile update but not for session activity that only bumps the session', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const refreshesBefore = h.native.clientRefreshCount;
      const updatedAtBefore = h.js.session?.updatedAt.getTime();

      await h.run(() => Promise.all([h.js.getSessionToken(), h.js.getSessionToken()]));
      await h.settle();

      expect(h.js.session?.updatedAt.getTime()).toBeGreaterThan(updatedAtBefore ?? Infinity);
      expect(h.native.clientRefreshCount - refreshesBefore).toBe(0);

      await h.run(() => h.js.updateProfile());
      await h.settle();

      expect(h.native.clientRefreshCount - refreshesBefore).toBe(1);
      expect(h.native.client?.sessions.find(session => session.id === sessionIds.user_1)?.profileVersion).toBe(1);
      await expectConverged(h);
    });

    it('refreshes native after a JS sign-in that lands while JS refetches a native change', async () => {
      const { server, token } = seedDevice();
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const client = h.js.client;
      if (!client) {
        throw new Error('JS has no client');
      }
      const fetchClient = client.fetch;
      let jsSessionId: string | undefined;
      client.fetch = async options => {
        client.fetch = fetchClient;
        jsSessionId = await h.js.signIn('user_2');
        return fetchClient(options);
      };

      await h.run(() => h.native.signIn('user_1'));
      await h.settle();

      expect(h.js.session?.id).toBe(jsSessionId);
      expect(h.native.activeSessionId).toBe(jsSessionId);
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

  describe('sign-out that never reaches the server', () => {
    it('lets another user sign in on a single-session instance', async () => {
      const { server, token } = seedDevice(['user_1']);
      server.singleSessionMode = true;
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.failNextRequests('js', 'DELETE /client/sessions');
      await expect(h.run(() => h.js.signOut())).rejects.toThrow('Network request failed');
      await h.settle();
      expect(h.js.session).toBeNull();

      const sessionId = await h.run(() => h.js.signIn('user_2'));

      expect(h.js.session?.id).toBe(sessionId);
      expect(h.js.client?.signedInSessions.map(session => session.id)).toEqual([sessionId]);
      await expectConverged(h);
    });

    it('lets another user sign in when clerk-js signs out locally instead of throwing', async () => {
      const { server, token } = seedDevice(['user_1']);
      server.singleSessionMode = true;
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      h.js.rethrowOfflineNetworkErrors = true;

      server.failNextRequests('js', 'DELETE /client/sessions');
      await h.run(() => h.js.signOut());
      await h.settle();
      expect(h.js.session).toBeNull();

      const sessionId = await h.run(() => h.js.signIn('user_2'));

      expect(h.js.session?.id).toBe(sessionId);
      await expectConverged(h);
    });

    it('keeps JS signed out when native reports a change afterwards', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.failNextRequests('js', 'DELETE /client/sessions');
      await expect(h.run(() => h.js.signOut())).rejects.toThrow('Network request failed');
      await h.settle();
      expect(h.js.session).toBeNull();

      await h.run(() => h.native.emitChange({ client: true, deviceToken: false }, { kind: 'native' }));
      await h.settle();

      expect(h.js.session).toBeNull();
      await expectConverged(h);
    });

    it('keeps the old device token out of the app token cache when an earlier request lands afterwards', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const held = server.holdNextResponse('js', 'PATCH /me');
      const update = h.run(() => h.js.updateProfile());
      await held.handled;

      server.failNextRequests('js', 'DELETE /client/sessions');
      await expect(h.run(() => h.js.signOut())).rejects.toThrow('Network request failed');
      await h.settle();
      held.release();
      await update;
      await h.settle();

      expect(h.native.token).toBeNull();
      expect(h.persistentTokenCache?.read(CLERK_CLIENT_JWT_KEY)).toBeNull();
    });

    it('keeps JS signed out when a client fetch sent before the sign-out lands afterwards', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const held = server.holdNextResponse('js', 'GET /client');
      await h.run(() => h.native.emitChange({ client: true, deviceToken: false }, { kind: 'native' }));
      await held.handled;

      server.failNextRequests('js', 'DELETE /client/sessions');
      await expect(h.run(() => h.js.signOut())).rejects.toThrow('Network request failed');
      const emissionIndex = h.js.emissions.length;
      held.release();
      await h.settle();

      expect(h.js.emissions.slice(emissionIndex).filter(emission => emission.signedInSessionIds.length)).toEqual([]);
      expect(h.js.session).toBeNull();
      expect(h.native.token).toBeNull();
    });

    it('keeps the next sign-in when a client fetch sent before the sign-out lands afterwards', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      const held = server.holdNextResponse('js', 'GET /client');
      await h.run(() => h.native.emitChange({ client: true, deviceToken: false }, { kind: 'native' }));
      await held.handled;

      server.failNextRequests('js', 'DELETE /client/sessions');
      await expect(h.run(() => h.js.signOut())).rejects.toThrow('Network request failed');
      const sessionId = await h.run(() => h.js.signIn('user_2'));
      const emissionIndex = h.js.emissions.length;
      held.release();
      await h.settle();

      expect(signedOutEmissionsSince(h, emissionIndex)).toEqual([]);
      expect(h.js.session?.id).toBe(sessionId);
      await expectConverged(h);
    });

    it('keeps the next sign-in when an earlier request rotates the signed-out token afterwards', async () => {
      const { server, token } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });
      server.rotateTokenOnNextResponse(token);
      const held = server.holdNextResponse('js', 'PATCH /me');
      const update = h.run(() => h.js.updateProfile());
      await held.handled;

      server.failNextRequests('js', 'DELETE /client/sessions');
      await expect(h.run(() => h.js.signOut())).rejects.toThrow('Network request failed');
      await h.settle();
      const sessionId = await h.run(() => h.js.signIn('user_2'));
      const signedInClientId = server.clientIdForToken(h.native.token);

      held.release();
      await update;
      await h.settle();

      expect(h.js.session?.id).toBe(sessionId);
      expect(server.clientIdForToken(h.native.token)).toBe(signedInClientId);
      await expectConverged(h);
    });

    it('keeps the device token and the other sessions when signing out of one of several', async () => {
      const { server, token, sessionIds } = seedDevice(['user_1', 'user_2'], 'user_1');
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.failNextRequests('js', 'POST /client/sessions/:id/remove');
      await expect(h.run(() => h.js.signOut({ sessionId: sessionIds.user_1 }))).rejects.toThrow(
        'Network request failed',
      );
      await h.settle();

      expect(h.js.session).toBeNull();
      expect(await h.jsDeviceToken()).toBe(token);
      expect(server.inspectClient(token)?.sessions.map(session => session.id)).toEqual([
        sessionIds.user_1,
        sessionIds.user_2,
      ]);
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

    it('keeps a JS sign-in on its client when a stale-token native refresh lands a new client first', async () => {
      const { server, token, clientId } = seedDevice([]);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.rotateTokenOnNextResponse(token);
      const signInResponse = server.holdNextResponse('js', 'POST /client/sign_ins');
      const signingIn = h.js.signIn('user_1');
      await signInResponse.handled;
      await h.run(() => h.native.refresh());
      await h.settle();
      expect(server.clientIdForToken(h.native.token)).not.toBe(clientId);

      signInResponse.release();
      const sessionId = await h.run(() => signingIn);
      await h.settle();

      expect(h.js.client?.id).toBe(clientId);
      expect(h.js.session?.id).toBe(sessionId);
      expect(h.native.activeSessionId).toBe(sessionId);
      await expectConverged(h);
    });

    it("keeps JS signed in when a pull answers for a client that is no longer the shared token's client", async () => {
      const { server, token, clientId } = seedDevice([]);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.rotateTokenOnNextResponse(token);
      const signInResponse = server.holdNextResponse('js', 'POST /client/sign_ins');
      const signingIn = h.js.signIn('user_1');
      await signInResponse.handled;
      const pullResponse = server.holdNextResponse('js', 'GET /client');
      await h.run(() => h.native.refresh());
      await pullResponse.handled;
      signInResponse.release();
      const sessionId = await h.run(() => signingIn);
      expect(h.js.session?.id).toBe(sessionId);
      const emissionIndex = h.js.emissions.length;

      pullResponse.release();
      await h.settle();

      expect(signedOutEmissionsSince(h, emissionIndex)).toEqual([]);
      expect(h.js.client?.id).toBe(clientId);
      expect(h.js.session?.id).toBe(sessionId);
      const sharedToken = await h.jsDeviceToken();
      expect(h.native.token).toBe(sharedToken);
      expect(server.clientIdForToken(sharedToken)).toBe(clientId);
      await expectConverged(h);
    });

    it('keeps the session when native signs out with the pre-rotation token while a JS response rotates it', async () => {
      const { server, token, clientId, sessionIds } = seedDevice(['user_1']);
      const h = await start({ server, jsDeviceToken: token, nativeDeviceToken: token });

      server.rotateTokenOnNextResponse(token);
      const profileResponse = server.holdNextResponse('js', 'PATCH /me');
      const updating = h.js.updateProfile();
      await profileResponse.handled;
      await h.run(() => h.native.signOut());
      await h.settle();
      expect(server.clientIdForToken(h.native.token)).not.toBe(clientId);

      profileResponse.release();
      await h.run(() => updating);
      await h.settle();

      const sharedToken = await h.jsDeviceToken();
      expect(h.native.token).toBe(sharedToken);
      expect(server.clientIdForToken(sharedToken)).toBe(clientId);
      expect(server.inspectClient(sharedToken)?.sessions.map(session => session.id)).toEqual([sessionIds.user_1]);
      expect(h.js.client?.id).toBe(clientId);
      expect(h.js.session?.id).toBe(sessionIds.user_1);
      await expectConverged(h);
    });
  });
});
