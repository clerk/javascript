import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus, events } from '../../events';
import { Environment } from '../../resources/Environment';

const mocks = vi.hoisted(() => ({
  sessionCookie: { set: vi.fn(), remove: vi.fn(), get: vi.fn() },
  clientUatCookie: { set: vi.fn(), remove: vi.fn(), get: vi.fn(() => 0) },
  activeContextCookie: { set: vi.fn(), remove: vi.fn(), get: vi.fn<() => string | undefined>(() => undefined) },
  devBrowser: {
    clear: vi.fn(),
    setup: vi.fn(() => Promise.resolve()),
    getDevBrowser: vi.fn(() => 'deadbeef'),
    refreshCookies: vi.fn(),
  },
  inCrossOriginIframe: vi.fn(() => false),
}));

vi.mock('../cookies/session', () => ({ createSessionCookie: () => mocks.sessionCookie }));
vi.mock('../cookies/clientUat', () => ({ createClientUatCookie: () => mocks.clientUatCookie }));
vi.mock('../cookies/activeContext', () => ({ createActiveContextCookie: () => mocks.activeContextCookie }));
vi.mock('../cookieSuffix', () => ({ getCookieSuffix: vi.fn(() => Promise.resolve('suffix')) }));
vi.mock('../devBrowser', () => ({ createDevBrowser: () => mocks.devBrowser }));
vi.mock('@clerk/shared/internal/clerk-js/runtime', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, inCrossOriginIframe: () => mocks.inCrossOriginIframe() };
});

import { AuthCookieService } from '../AuthCookieService';

const setFocus = (hasFocus: boolean) =>
  Object.defineProperty(document, 'hasFocus', { value: () => hasFocus, configurable: true });
const setVisibility = (state: DocumentVisibilityState) =>
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });

describe('AuthCookieService session cookie refresh', () => {
  const getToken = vi.fn(() => Promise.resolve('fresh-jwt'));
  const clerkStub = {
    publishableKey: 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ',
    frontendApi: 'clerk.abcef.12345.dev.lclclerk.com',
    loaded: true,
    session: { id: 'sess_active', getToken },
    organization: null,
    user: {},
    client: {},
    handleUnauthenticated: vi.fn(),
  } as any;
  const clerkEventBusStub = { emit: vi.fn(), on: vi.fn(), prioritizedOn: vi.fn() } as any;

  const createService = () => AuthCookieService.create(clerkStub, {} as any, 'production', clerkEventBusStub);
  const emitTokenUpdate = (raw: string) =>
    eventBus.emit(events.TokenUpdate, { token: { getRawString: () => raw } as any });

  let service: Awaited<ReturnType<typeof createService>> | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.inCrossOriginIframe.mockReturnValue(false);
    mocks.activeContextCookie.get.mockReturnValue(undefined);
    getToken.mockResolvedValue('fresh-jwt');
    Environment.getInstance().partitionedCookies = false;
    setFocus(true);
    setVisibility('visible');
  });

  afterEach(() => {
    service?.dispose();
    service = undefined;
  });

  it('disposes only its own listeners and leaves another service active', async () => {
    service = await createService();
    const other = await createService();
    service.dispose();
    service.dispose();
    mocks.sessionCookie.set.mockClear();
    getToken.mockClear();

    emitTokenUpdate('remaining-service');
    expect(mocks.sessionCookie.set).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(getToken).toHaveBeenCalledTimes(2);
    mocks.sessionCookie.remove.mockClear();
    mocks.devBrowser.refreshCookies.mockClear();
    eventBus.emit(events.UserSignOut, null);
    eventBus.emit(events.EnvironmentUpdate, null);
    expect(mocks.sessionCookie.remove).toHaveBeenCalledOnce();
    expect(mocks.devBrowser.refreshCookies).toHaveBeenCalledOnce();
    other.dispose();
  });

  it('does not write a cookie when an in-flight refresh completes after disposal', async () => {
    service = await createService();
    const pending = createDeferredPromise();
    getToken.mockReturnValue(pending.promise.then(() => 'after-disposal'));
    window.dispatchEvent(new Event('focus'));
    service.dispose();
    mocks.sessionCookie.set.mockClear();

    pending.resolve('after-disposal');
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.sessionCookie.set).not.toHaveBeenCalled();
  });

  it('releases listeners when cookie setup fails', async () => {
    const eventNames = [events.TokenUpdate, events.UserSignOut, events.EnvironmentUpdate] as const;
    const before = eventNames.map(event => eventBus.internal.retrieveListeners(event).length);
    mocks.devBrowser.clear.mockImplementationOnce(() => {
      throw new Error('cookie setup failed');
    });

    await expect(createService()).rejects.toThrow('cookie setup failed');

    expect(eventNames.map(event => eventBus.internal.retrieveListeners(event).length)).toEqual(before);
  });

  it('registers both focus and visibilitychange listeners', async () => {
    const windowSpy = vi.spyOn(window, 'addEventListener');
    const documentSpy = vi.spyOn(document, 'addEventListener');

    service = await createService();

    expect(windowSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(documentSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('writes the session cookie on token:update when the tab is focused', async () => {
    service = await createService();

    emitTokenUpdate('jwt-focused');

    expect(mocks.sessionCookie.set).toHaveBeenCalledWith('jwt-focused');
  });

  it('does not write when unfocused, outside an iframe, and the active context does not match', async () => {
    mocks.activeContextCookie.get.mockReturnValue('sess_other:');
    service = await createService();
    setFocus(false);

    emitTokenUpdate('jwt-blocked');

    expect(mocks.sessionCookie.set).not.toHaveBeenCalledWith('jwt-blocked');
  });

  it('writes when unfocused but in a visible cross-origin iframe, even if the active context does not match', async () => {
    mocks.activeContextCookie.get.mockReturnValue('sess_other:');
    mocks.inCrossOriginIframe.mockReturnValue(true);
    service = await createService();
    setFocus(false);
    setVisibility('visible');

    emitTokenUpdate('jwt-iframe');

    expect(mocks.sessionCookie.set).toHaveBeenCalledWith('jwt-iframe');
  });

  it('does not write in a cross-origin iframe while it is hidden', async () => {
    mocks.activeContextCookie.get.mockReturnValue('sess_other:');
    mocks.inCrossOriginIframe.mockReturnValue(true);
    service = await createService();
    setFocus(false);
    setVisibility('hidden');

    emitTokenUpdate('jwt-hidden');

    expect(mocks.sessionCookie.set).not.toHaveBeenCalledWith('jwt-hidden');
  });

  it('refreshes the session cookie when an unfocused iframe becomes visible (visibilitychange)', async () => {
    mocks.inCrossOriginIframe.mockReturnValue(true);
    service = await createService();
    setFocus(false);
    setVisibility('visible');
    getToken.mockResolvedValue('jwt-on-visible');
    mocks.sessionCookie.set.mockClear();

    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(mocks.sessionCookie.set).toHaveBeenCalledWith('jwt-on-visible'));

    expect(getToken).toHaveBeenCalled();
  });

  it('rewrites the session cookie after partitioned cookies resolve', async () => {
    service = await createService();
    getToken.mockResolvedValue('jwt-after-environment');
    Environment.getInstance().partitionedCookies = true;
    mocks.sessionCookie.set.mockClear();

    eventBus.emit(events.EnvironmentUpdate, null);

    await vi.waitFor(() => expect(mocks.sessionCookie.set).toHaveBeenCalledWith('jwt-after-environment'));
    expect(mocks.devBrowser.refreshCookies).toHaveBeenCalled();
  });
});
