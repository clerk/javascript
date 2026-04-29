import type { ClientJSONSnapshot } from '@clerk/shared/types';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DevBrowser } from '../auth/devBrowser';
import { Clerk } from '../clerk';
import { eventBus, events } from '../events';
import type { DisplayConfig } from '../resources/internal';
import { Client, Environment } from '../resources/internal';

// --- Module mocks ---

const mockClientFetch = vi.fn();
const mockEnvironmentFetch = vi.fn(() => Promise.resolve({}));

vi.mock('../resources/Client');
vi.mock('../resources/Environment');

vi.mock('../auth/devBrowser', () => ({
  createDevBrowser: (): DevBrowser => ({
    clear: vi.fn(),
    setup: vi.fn(),
    getDevBrowser: vi.fn(() => 'deadbeef'),
    setDevBrowser: vi.fn(),
    removeDevBrowser: vi.fn(),
    refreshCookies: vi.fn(),
  }),
}));

// Mock SWRClientCache and isTokenExpiringSoon
const mockSWRRead = vi.fn<() => ClientJSONSnapshot | null>().mockReturnValue(null);
const mockSWRSave = vi.fn();
const mockSWRClear = vi.fn();
const mockIsTokenExpiringSoon = vi.fn().mockReturnValue(true);

vi.mock('../swr-client-cache', () => ({
  SWRClientCache: {
    read: (...args: unknown[]) => mockSWRRead(...(args as [])),
    save: (...args: unknown[]) => mockSWRSave(...(args as [])),
    clear: (...args: unknown[]) => mockSWRClear(...(args as [])),
  },
  isTokenExpiringSoon: (...args: unknown[]) => mockIsTokenExpiringSoon(...(args as [])),
}));

Client.getOrCreateInstance = vi.fn().mockImplementation(() => {
  return { fetch: mockClientFetch };
});
(Client as any).clearInstance = vi.fn();

Environment.getInstance = vi.fn().mockImplementation(() => {
  return { fetch: mockEnvironmentFetch };
});

// --- Helpers ---

const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

const mockNavigate = vi.fn((to: string) => Promise.resolve(to));
const mockedLoadOptions = { routerPush: mockNavigate, routerReplace: mockNavigate };

const mockDisplayConfig = {
  signInUrl: 'http://test.host/sign-in',
  signUpUrl: 'http://test.host/sign-up',
  userProfileUrl: 'http://test.host/user-profile',
  homeUrl: 'http://test.host/home',
  createOrganizationUrl: 'http://test.host/create-organization',
  organizationProfileUrl: 'http://test.host/organization-profile',
} as DisplayConfig;

const mockUserSettings = {
  signUp: {
    captcha_enabled: false,
  },
};

function makeMockSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sess_123',
    status: 'active',
    user: { id: 'user_123', first_name: 'Alice' },
    remove: vi.fn(),
    touch: vi.fn(() => Promise.resolve()),
    __internal_touch: vi.fn(() => Promise.resolve()),
    getToken: vi.fn(),
    lastActiveToken: { getRawString: () => 'mocked-token' },
    ...overrides,
  };
}

function makeCachedSnapshot(sessions?: ClientJSONSnapshot['sessions']): ClientJSONSnapshot {
  return {
    object: 'client' as const,
    id: 'client_cached',
    sessions: sessions ?? [
      {
        object: 'session' as const,
        id: 'sess_123',
        status: 'active',
        user: { object: 'user' as const, id: 'user_123', first_name: 'Alice' } as any,
        last_active_token: null,
        last_active_organization_id: null,
      } as any,
    ],
    sign_in: null as any,
    sign_up: null as any,
    last_active_session_id: 'sess_123',
    created_at: Date.now(),
    updated_at: Date.now(),
  } as ClientJSONSnapshot;
}

// --- Test suite ---

const oldWindowLocation = window.location;

describe('Clerk SWR initialization', () => {
  let mockWindowLocation: any;
  let mockHref: ReturnType<typeof vi.fn>;

  afterAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: oldWindowLocation,
    });
  });

  beforeEach(() => {
    mockHref = vi.fn();
    mockWindowLocation = {
      host: 'test.host',
      hostname: 'test.host',
      origin: 'http://test.host',
      get href() {
        return 'http://test.host';
      },
      set href(v: string) {
        mockHref(v);
      },
    };

    Object.defineProperty(global.window, 'location', { value: mockWindowLocation });

    if (typeof globalThis.document !== 'undefined') {
      Object.defineProperty(global.window.document, 'hasFocus', { value: () => true, configurable: true });
    }

    Object.defineProperty(global.window, 'addEventListener', {
      value: vi.fn(),
    });

    mockEnvironmentFetch.mockReturnValue(
      Promise.resolve({
        userSettings: mockUserSettings,
        displayConfig: mockDisplayConfig,
        isSingleSession: () => false,
        isProduction: () => true,
        isDevelopmentOrStaging: () => false,
      }),
    );

    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [],
      }),
    );

    mockSWRRead.mockReturnValue(null);
    mockSWRSave.mockReset();
    mockSWRClear.mockReset();
    mockIsTokenExpiringSoon.mockReturnValue(true);

    eventBus.off(events.TokenUpdate);
  });

  afterEach(() => {
    mockNavigate.mockReset();
    vi.mocked(Client.getOrCreateInstance).mockClear();
    (Client as any).clearInstance.mockClear();
  });

  // Test 1: SWR disabled (default) - normal flow, no cache read
  it('does not read SWR cache when swr is disabled (default)', async () => {
    mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [] }));

    const sut = new Clerk(productionPublishableKey);
    await sut.load(mockedLoadOptions);

    expect(mockSWRRead).not.toHaveBeenCalled();
  });

  // Test 2: SWR enabled, no cache - normal flow
  it('proceeds with normal flow when SWR enabled but no cache exists', async () => {
    mockSWRRead.mockReturnValue(null);
    // The normal flow resolves to a client object. The SWR listener calls __internal_toSnapshot,
    // so the mock must provide it.
    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [],
        __internal_toSnapshot: vi.fn(() => ({ object: 'client', id: 'client_1', sessions: [] })),
      }),
    );

    const sut = new Clerk(productionPublishableKey);
    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    expect(mockSWRRead).toHaveBeenCalledWith(productionPublishableKey);
    // Normal flow: Client.getOrCreateInstance().fetch() should have been called
    expect(mockClientFetch).toHaveBeenCalled();
  });

  // Test 3: SWR enabled, cache exists, cookie JWT valid - emit ready immediately
  it('emits ready immediately when cache exists and cookie JWT is still valid', async () => {
    const cachedSnapshot = makeCachedSnapshot();
    mockSWRRead.mockReturnValue(cachedSnapshot);

    // The cached client returned by Client.getOrCreateInstance(cachedSnapshot)
    const mockSession = makeMockSession();
    const mockCachedClient = {
      signedInSessions: [mockSession],
      sessions: [mockSession],
      lastActiveSessionId: 'sess_123',
      fetch: mockClientFetch,
      __internal_toSnapshot: vi.fn(() => cachedSnapshot),
    };

    vi.mocked(Client.getOrCreateInstance).mockImplementation((data?: any) => {
      if (data) {
        // Called with cached snapshot
        return mockCachedClient as any;
      }
      // Called for background refresh
      return { fetch: mockClientFetch } as any;
    });

    // Token is still valid
    mockIsTokenExpiringSoon.mockReturnValue(false);

    // Background refresh resolves with updated client
    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [mockSession],
        __internal_toSnapshot: vi.fn(() => cachedSnapshot),
      }),
    );

    const statusEvents: string[] = [];
    const sut = new Clerk(productionPublishableKey);
    sut.on('status', (status: string) => {
      statusEvents.push(status);
    });

    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    // Should have read the cache
    expect(mockSWRRead).toHaveBeenCalledWith(productionPublishableKey);
    // Token should not be expired
    expect(mockIsTokenExpiringSoon).toHaveBeenCalled();
    // Session should be set from cache
    expect(sut.session?.id).toBe('sess_123');
    // getToken should NOT have been called (token was still valid)
    expect(mockSession.getToken).not.toHaveBeenCalled();
    // Status should have been set to ready
    expect(statusEvents).toContain('ready');
  });

  // Test 4: SWR enabled, cache exists, cookie JWT expired, getToken succeeds
  it('emits ready after getToken succeeds when cookie JWT is expired', async () => {
    const cachedSnapshot = makeCachedSnapshot();
    mockSWRRead.mockReturnValue(cachedSnapshot);

    const mockSession = makeMockSession({
      getToken: vi.fn().mockResolvedValue({ getRawString: () => 'fresh-token' }),
    });

    const mockCachedClient = {
      signedInSessions: [mockSession],
      sessions: [mockSession],
      lastActiveSessionId: 'sess_123',
      fetch: mockClientFetch,
      __internal_toSnapshot: vi.fn(() => cachedSnapshot),
    };

    vi.mocked(Client.getOrCreateInstance).mockImplementation((data?: any) => {
      if (data) {
        return mockCachedClient as any;
      }
      return { fetch: mockClientFetch } as any;
    });

    // Token is expired
    mockIsTokenExpiringSoon.mockReturnValue(true);

    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [mockSession],
        __internal_toSnapshot: vi.fn(() => cachedSnapshot),
      }),
    );

    const statusEvents: string[] = [];
    const sut = new Clerk(productionPublishableKey);
    sut.on('status', (status: string) => {
      statusEvents.push(status);
    });

    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    // getToken should have been called since the JWT was expired
    expect(mockSession.getToken).toHaveBeenCalledWith({ skipCache: true });
    // Session should be set from cache
    expect(sut.session?.id).toBe('sess_123');
    // Status should be ready
    expect(statusEvents).toContain('ready');
  });

  // Test 5: SWR enabled, cache exists, cookie JWT expired, getToken 401 - discard cache, normal flow
  it('discards cache and proceeds to normal flow when getToken returns 401', async () => {
    const cachedSnapshot = makeCachedSnapshot();
    mockSWRRead.mockReturnValue(cachedSnapshot);

    // Create a 4xx error
    const error401 = new Error('Unauthorized');
    (error401 as any).status = 401;
    // is4xxError checks for ClerkAPIResponseError with status 4xx
    Object.defineProperty(error401, 'clerkError', { value: true });
    (error401 as any).errors = [{ code: 'session_not_found' }];

    const mockSession = makeMockSession({
      getToken: vi.fn().mockRejectedValue(error401),
    });

    const mockCachedClient = {
      signedInSessions: [mockSession],
      sessions: [mockSession],
      lastActiveSessionId: 'sess_123',
      fetch: mockClientFetch,
      __internal_toSnapshot: vi.fn(() => cachedSnapshot),
    };

    vi.mocked(Client.getOrCreateInstance).mockImplementation((data?: any) => {
      if (data) {
        return mockCachedClient as any;
      }
      return { fetch: mockClientFetch } as any;
    });

    // Token is expired
    mockIsTokenExpiringSoon.mockReturnValue(true);

    // Normal flow fetch returns a signed-out client
    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [],
        __internal_toSnapshot: vi.fn(() => ({ object: 'client', id: 'client_1', sessions: [] })),
      }),
    );

    const sut = new Clerk(productionPublishableKey);
    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    // Cache should have been cleared
    expect(mockSWRClear).toHaveBeenCalledWith(productionPublishableKey);
    // Client.clearInstance should have been called to discard cached client
    expect((Client as any).clearInstance).toHaveBeenCalled();
    // Normal flow: Client.getOrCreateInstance().fetch() runs
    expect(mockClientFetch).toHaveBeenCalled();
  });

  // Test 6: SWR enabled, cache exists, cookie JWT expired, getToken network error - emit degraded
  it('emits degraded with cached data when getToken has a transient network error', async () => {
    const cachedSnapshot = makeCachedSnapshot();
    mockSWRRead.mockReturnValue(cachedSnapshot);

    // Network error (not a 4xx)
    const networkError = new Error('Failed to fetch');

    const mockSession = makeMockSession({
      getToken: vi.fn().mockRejectedValue(networkError),
    });

    const mockCachedClient = {
      signedInSessions: [mockSession],
      sessions: [mockSession],
      lastActiveSessionId: 'sess_123',
      fetch: mockClientFetch,
      __internal_toSnapshot: vi.fn(() => cachedSnapshot),
    };

    vi.mocked(Client.getOrCreateInstance).mockImplementation((data?: any) => {
      if (data) {
        return mockCachedClient as any;
      }
      return { fetch: mockClientFetch } as any;
    });

    // Token is expired
    mockIsTokenExpiringSoon.mockReturnValue(true);

    // Background refresh should also fail or never resolve in a network error scenario.
    // Use a promise that never resolves to prevent the background refresh from
    // overwriting the cached session.
    mockClientFetch.mockReturnValue(new Promise(() => {}));

    const statusEvents: string[] = [];
    const sut = new Clerk(productionPublishableKey);
    sut.on('status', (status: string) => {
      statusEvents.push(status);
    });

    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    // Session should still be set from cache (degraded mode)
    expect(sut.session?.id).toBe('sess_123');
    // Status should be degraded (transient error means token is unvalidated)
    expect(statusEvents).toContain('degraded');
    // Cache should NOT have been cleared (session might still be valid)
    expect(mockSWRClear).not.toHaveBeenCalledWith(productionPublishableKey);
  });

  // Test 7: SWR enabled, corrupted cache - proceed to normal flow
  it('proceeds to normal flow when cache is corrupted', async () => {
    const corruptedSnapshot = makeCachedSnapshot();
    mockSWRRead.mockReturnValue(corruptedSnapshot);

    // Simulate corruption: only the first call with data (SWR cache) throws.
    // Subsequent calls (from createClientFromJwt in the normal flow) succeed normally.
    let thrownOnce = false;
    vi.mocked(Client.getOrCreateInstance).mockImplementation((data?: any) => {
      if (data && !thrownOnce) {
        thrownOnce = true;
        throw new Error('Failed to parse cached client data');
      }
      return { fetch: mockClientFetch } as any;
    });

    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [],
        __internal_toSnapshot: vi.fn(() => ({ object: 'client', id: 'client_1', sessions: [] })),
      }),
    );

    const sut = new Clerk(productionPublishableKey);
    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    // Cache should be cleared on error
    expect(mockSWRClear).toHaveBeenCalledWith(productionPublishableKey);
    // Should fall through to normal flow
    expect(mockClientFetch).toHaveBeenCalled();
  });

  // Test 8: Session fallback - cached session gone from fresh /client, falls back to defaultSession
  it('falls back to defaultSession when cached session is gone from fresh client', async () => {
    const cachedSnapshot = makeCachedSnapshot();
    mockSWRRead.mockReturnValue(cachedSnapshot);

    const mockSession = makeMockSession({ id: 'sess_123' });

    const mockCachedClient = {
      signedInSessions: [mockSession],
      sessions: [mockSession],
      lastActiveSessionId: 'sess_123',
      fetch: mockClientFetch,
      __internal_toSnapshot: vi.fn(() => cachedSnapshot),
    };

    vi.mocked(Client.getOrCreateInstance).mockImplementation((data?: any) => {
      if (data) {
        return mockCachedClient as any;
      }
      return { fetch: mockClientFetch } as any;
    });

    // Token is still valid
    mockIsTokenExpiringSoon.mockReturnValue(false);

    // Fresh /client returns a different session (original session is gone)
    const freshSession = makeMockSession({ id: 'sess_456', user: { id: 'user_456', first_name: 'Bob' } });
    const freshClient = {
      signedInSessions: [freshSession],
      sessions: [freshSession],
      lastActiveSessionId: 'sess_456',
      __internal_toSnapshot: vi.fn(() => ({
        ...cachedSnapshot,
        sessions: [{ ...cachedSnapshot.sessions[0], id: 'sess_456' }],
        last_active_session_id: 'sess_456',
      })),
    };

    mockClientFetch.mockReturnValue(Promise.resolve(freshClient));

    const sut = new Clerk(productionPublishableKey);
    await sut.load({ ...mockedLoadOptions, experimental: { swr: true } });

    // Initially loaded with cached session
    // After background refresh, session should be updated.
    // The SWR background refresh detects the cached session is gone and
    // falls back to defaultSession before calling updateClient.

    // Wait for background refresh to complete
    await vi.waitFor(() => {
      expect(mockClientFetch).toHaveBeenCalled();
    });

    // The session should now be the fresh one (since the cached session was not in the fresh client,
    // the SWR refresh falls back to defaultSession which picks the first signedInSession)
    expect(sut.session?.id).toBe('sess_456');
  });
});
