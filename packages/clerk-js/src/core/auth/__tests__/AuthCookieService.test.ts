import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus, events } from '../../events';

const mocks = vi.hoisted(() => ({
  sessionCookie: { set: vi.fn(), remove: vi.fn(), get: vi.fn() },
  clientUatCookie: { set: vi.fn(), remove: vi.fn(), get: vi.fn(() => 0) },
  activeContextCookie: { set: vi.fn(), remove: vi.fn(), get: vi.fn<() => string | undefined>(() => undefined) },
  inCrossOriginIframe: vi.fn(() => false),
}));

vi.mock('../cookies/session', () => ({ createSessionCookie: () => mocks.sessionCookie }));
vi.mock('../cookies/clientUat', () => ({ createClientUatCookie: () => mocks.clientUatCookie }));
vi.mock('../cookies/activeContext', () => ({ createActiveContextCookie: () => mocks.activeContextCookie }));
vi.mock('../cookieSuffix', () => ({ getCookieSuffix: vi.fn(() => Promise.resolve('suffix')) }));
vi.mock('../devBrowser', () => ({
  createDevBrowser: () => ({
    clear: vi.fn(),
    setup: vi.fn(() => Promise.resolve()),
    getDevBrowser: vi.fn(() => 'deadbeef'),
    refreshCookies: vi.fn(),
  }),
}));
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
    setFocus(true);
    setVisibility('visible');
  });

  afterEach(() => {
    service?.stopPollingForToken();
    service = undefined;
    // The service registers listeners on the shared event bus on construction.
    eventBus.off(events.TokenUpdate);
    eventBus.off(events.UserSignOut);
    eventBus.off(events.EnvironmentUpdate);
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
});
