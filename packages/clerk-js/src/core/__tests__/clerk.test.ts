import { ClerkRuntimeError, EmailLinkErrorCodeStatus } from '@clerk/shared/error';
import type {
  ActiveSessionResource,
  PendingSessionResource,
  SignedInSessionResource,
  SignInJSON,
  SignUpJSON,
  TokenResource,
} from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { mockJwt } from '@/test/core-fixtures';

import { mockNativeRuntime } from '../../test/utils';
import { AuthCookieService } from '../auth/AuthCookieService';
import type { DevBrowser } from '../auth/devBrowser';
import { Clerk } from '../clerk';
import * as errorsModule from '../errors';
import { eventBus, events } from '../events';
import type { DisplayConfig, Organization } from '../resources/internal';
import { BaseResource, Client, Environment, SignIn, SignUp } from '../resources/internal';

const mockClientFetch = vi.fn();
const mockEnvironmentFetch = vi.fn(() => Promise.resolve({}));

vi.mock('../resources/Client');
vi.mock('../resources/Environment');

vi.mock('../auth/devBrowser', () => ({
  createDevBrowser: (): DevBrowser => ({
    clear: vi.fn(),
    setup: vi.fn(),
    getDevBrowserJWT: vi.fn(() => 'deadbeef'),
    setDevBrowserJWT: vi.fn(),
    removeDevBrowserJWT: vi.fn(),
  }),
}));

Client.getOrCreateInstance = vi.fn().mockImplementation(() => {
  return { fetch: mockClientFetch };
});
Environment.getInstance = vi.fn().mockImplementation(() => {
  return { fetch: mockEnvironmentFetch };
});

const oldWindowLocation = window.location;
const setWindowQueryParams = (params: Array<[string, string]>) => {
  // @ts-expect-error - Forcing delete on non-optional property for testing purposes
  delete window.location;
  const u = new URL(oldWindowLocation.href);
  params.forEach(([k, v]) => u.searchParams.append(k, v));
  (window.location as any) = u;
};

describe('Clerk singleton', () => {
  // Use a FAPI value for local production instances to avoid triggering the devInit flow during testing
  const developmentPublishableKey = 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ';
  const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

  const mockNavigate = vi.fn((to: string) => Promise.resolve(to));
  const mockedLoadOptions = { routerDebug: true, routerPush: mockNavigate, routerReplace: mockNavigate };

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

  let mockWindowLocation;
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

    const mockAddEventListener = (type: string, callback: (e: any) => void) => {
      if (type === 'message') {
        callback({
          origin: 'https://' + productionPublishableKey,
          data: {
            browserToken: 'hey',
          },
        });
      }
    };

    Object.defineProperty(global.window, 'addEventListener', {
      value: mockAddEventListener,
    });

    mockEnvironmentFetch.mockReturnValue(
      Promise.resolve({
        userSettings: mockUserSettings,
        displayConfig: mockDisplayConfig,
        isSingleSession: () => false,
        isProduction: () => false,
        isDevelopmentOrStaging: () => true,
      }),
    );

    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [],
      }),
    );

    eventBus.off(events.TokenUpdate);
  });

  afterEach(() => mockNavigate.mockReset());

  describe('initialize', () => {
    it('should consider publishableKey readonly', () => {
      const sut = new Clerk(productionPublishableKey);
      expect(sut.publishableKey).toEqual(productionPublishableKey);

      expect(() => {
        // @ts-expect-error attempt to override getter field
        sut.publishableKey = 'aloha';
      }).toThrowError(/Cannot set property publishableKey of #<Clerk>/);
    });

    it('should throw when publishableKey is invalid', () => {
      expect(() => {
        new Clerk('invalidPK');
      }).toThrowError(/The publishableKey passed to Clerk is invalid/);
    });
  });

  describe('load retry behavior', () => {
    let originalMountComponentRenderer: typeof Clerk.mountComponentRenderer;

    const createMockAuthService = () => ({
      decorateUrlWithDevBrowserToken: vi.fn((url: URL) => url),
      getSessionCookie: vi.fn(() => null),
      handleUnauthenticatedDevBrowser: vi.fn(() => Promise.resolve()),
      isSignedOut: vi.fn(() => false),
      setClientUatCookieForDevelopmentInstances: vi.fn(),
      startPollingForToken: vi.fn(),
      stopPollingForToken: vi.fn(),
    });

    const createMockComponentControls = () => {
      const componentInstance = {
        mountImpersonationFab: vi.fn(),
        updateProps: vi.fn(),
      };

      return {
        ensureMounted: vi.fn().mockResolvedValue(componentInstance),
        prioritizedOn: vi.fn(),
      };
    };

    beforeEach(() => {
      originalMountComponentRenderer = Clerk.mountComponentRenderer;
    });

    afterEach(() => {
      Clerk.mountComponentRenderer = originalMountComponentRenderer;
      vi.useRealTimers();
    });

    it('retries once when dev browser authentication is lost', async () => {
      vi.useFakeTimers();

      const mockAuthService = createMockAuthService();
      const authCreateSpy = vi
        .spyOn(AuthCookieService, 'create')
        .mockResolvedValue(mockAuthService as unknown as AuthCookieService);

      const componentControls = createMockComponentControls();
      const devBrowserError = Object.assign(new Error('dev browser unauthenticated'), {
        errors: [{ code: 'dev_browser_unauthenticated' }],
        status: 401,
      });

      const mountSpy = vi
        .fn<NonNullable<typeof Clerk.mountComponentRenderer>>()
        .mockImplementationOnce(() => {
          throw devBrowserError;
        })
        .mockReturnValue(componentControls);

      Clerk.mountComponentRenderer = mountSpy;
      mockClientFetch.mockClear();

      const sut = new Clerk(productionPublishableKey);

      try {
        const loadPromise = sut.load();

        await vi.runAllTimersAsync();
        await loadPromise;
      } finally {
        authCreateSpy.mockRestore();
      }

      expect(mountSpy).toHaveBeenCalledTimes(2);
      expect(mockAuthService.handleUnauthenticatedDevBrowser).toHaveBeenCalledTimes(1);
      expect(mockClientFetch).toHaveBeenCalledTimes(2);
    });

    it('surfaces network errors after exhausting retries', async () => {
      vi.useFakeTimers();

      const mockAuthService = createMockAuthService();
      const authCreateSpy = vi
        .spyOn(AuthCookieService, 'create')
        .mockResolvedValue(mockAuthService as unknown as AuthCookieService);

      const networkError = new ClerkRuntimeError('Network failure', { code: 'network_error' });
      const mountSpy = vi.fn<NonNullable<typeof Clerk.mountComponentRenderer>>().mockImplementation(() => {
        throw networkError;
      });

      Clerk.mountComponentRenderer = mountSpy;
      mockClientFetch.mockClear();

      const errorSpy = vi.spyOn(errorsModule, 'clerkErrorInitFailed');
      const sut = new Clerk(productionPublishableKey);

      try {
        const loadPromise = sut.load();

        await vi.runAllTimersAsync();

        try {
          await loadPromise;
          throw new Error('Expected load to throw');
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toMatch(/Something went wrong initializing Clerk/);
          const cause = (err as Error).cause as any;
          expect(cause).toBeDefined();
          expect(cause.code).toBe('network_error');
          expect(cause.clerkRuntimeError).toBe(true);
        }

        expect(mountSpy).toHaveBeenCalledTimes(2);
        expect(mockClientFetch).toHaveBeenCalledTimes(2);
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenLastCalledWith(networkError);
        expect(mockAuthService.handleUnauthenticatedDevBrowser).not.toHaveBeenCalled();
      } finally {
        authCreateSpy.mockRestore();
        errorSpy.mockRestore();
      }
    });
  });

  describe('.setActive', () => {
    describe('with `active` session status', () => {
      const mockSession = {
        id: '1',
        remove: vi.fn(),
        status: 'active',
        user: {},
        touch: vi.fn(() => Promise.resolve()),
        getToken: vi.fn(),
        lastActiveToken: { getRawString: () => 'mocked-token' },
      };
      let eventBusSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        eventBusSpy = vi.spyOn(eventBus, 'emit');
      });

      afterEach(() => {
        mockSession.remove.mockReset();
        mockSession.touch.mockReset();

        eventBusSpy?.mockRestore();
        // cleanup global window pollution
        (window as any).__unstable__onBeforeSetActive = null;
        (window as any).__unstable__onAfterSetActive = null;
      });

      it('does not call session touch on signOut', async () => {
        mockSession.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: null });
        await waitFor(() => {
          expect(mockSession.touch).not.toHaveBeenCalled();
          expect(eventBusSpy).toHaveBeenCalledWith('token:update', { token: null });
        });
      });

      it('calls session.touch by default', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as ActiveSessionResource });
        expect(mockSession.touch).toHaveBeenCalled();
      });

      describe('with `touchSession` set to false', () => {
        it('calls session.touch by default outside of focus window event', async () => {
          mockSession.touch.mockReturnValue(Promise.resolve());
          mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

          const sut = new Clerk(productionPublishableKey);
          await sut.load({ touchSession: false });
          await sut.setActive({ session: mockSession as any as ActiveSessionResource });
          expect(mockSession.touch).toHaveBeenCalled();
        });
      });

      it('calls __unstable__onBeforeSetActive before session.touch', async () => {
        mockSession.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        (window as any).__unstable__onBeforeSetActive = () => {
          expect(mockSession.touch).not.toHaveBeenCalled();
        };

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as ActiveSessionResource });
        expect(mockSession.touch).toHaveBeenCalled();
      });

      it('sets __session and __client_uat cookie before calling __unstable__onBeforeSetActive', async () => {
        mockSession.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        (window as any).__unstable__onBeforeSetActive = () => {
          expect(eventBusSpy).toHaveBeenCalledWith('token:update', { token: mockSession.lastActiveToken });
        };

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as ActiveSessionResource });
      });

      it('calls __unstable__onAfterSetActive after beforeEmit and session.touch', async () => {
        const beforeEmitMock = vi.fn();
        mockSession.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        (window as any).__unstable__onAfterSetActive = () => {
          expect(mockSession.touch).toHaveBeenCalled();
          expect(beforeEmitMock).toHaveBeenCalled();
        };

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as ActiveSessionResource, beforeEmit: beforeEmitMock });
      });

      // TODO: @dimkl include set transitive state
      it('calls session.touch -> set cookie -> before emit with touched session on session switch', async () => {
        const mockSession2 = {
          id: '2',
          remove: vi.fn(),
          status: 'active',
          user: {},
          touch: vi.fn(),
          getToken: vi.fn(),
        };
        mockClientFetch.mockReturnValue(
          Promise.resolve({
            signedInSessions: [mockSession, mockSession2],
          }),
        );

        const sut = new Clerk(productionPublishableKey);
        await sut.load();

        const executionOrder: string[] = [];
        mockSession2.touch.mockImplementationOnce(() => {
          sut.session = mockSession2 as any;
          executionOrder.push('session.touch');
          return Promise.resolve();
        });
        mockSession2.getToken.mockImplementation(() => {
          executionOrder.push('set cookie');
          return 'mocked-token-2';
        });
        const beforeEmitMock = vi.fn().mockImplementationOnce(() => {
          executionOrder.push('before emit');
          return Promise.resolve();
        });

        await sut.setActive({ session: mockSession2 as any as ActiveSessionResource, beforeEmit: beforeEmitMock });

        await waitFor(() => {
          expect(executionOrder).toEqual(['session.touch', 'set cookie', 'before emit']);
          expect(mockSession2.touch).toHaveBeenCalled();
          expect(mockSession2.getToken).toHaveBeenCalled();
          expect(beforeEmitMock).toHaveBeenCalledWith(mockSession2);
          expect(sut.session).toMatchObject(mockSession2);
        });
      });

      // TODO: @dimkl include set transitive state
      it('calls with lastActiveOrganizationId session.touch -> set cookie -> before emit -> set accessors with touched session on organization switch', async () => {
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));
        const sut = new Clerk(productionPublishableKey);
        await sut.load();

        const executionOrder: string[] = [];
        mockSession.touch.mockImplementationOnce(() => {
          sut.session = mockSession as any;
          executionOrder.push('session.touch');
          return Promise.resolve();
        });
        mockSession.getToken.mockImplementation(() => {
          executionOrder.push('set cookie');
          return 'mocked-token';
        });

        const beforeEmitMock = vi.fn().mockImplementationOnce(() => {
          executionOrder.push('before emit');
          return Promise.resolve();
        });

        await sut.setActive({ organization: { id: 'org_id' } as Organization, beforeEmit: beforeEmitMock });

        await waitFor(() => {
          expect(executionOrder).toEqual(['session.touch', 'set cookie', 'before emit']);
          expect(mockSession.touch).toHaveBeenCalled();
          expect(mockSession.getToken).toHaveBeenCalled();
          expect((mockSession as any as ActiveSessionResource)?.lastActiveOrganizationId).toEqual('org_id');
          expect(beforeEmitMock).toHaveBeenCalledWith(mockSession);
          expect(sut.session).toMatchObject(mockSession);
        });
      });

      it('sets active organization by slug', async () => {
        const mockSession2 = {
          id: '1',
          status,
          user: {
            organizationMemberships: [
              {
                id: 'orgmem_id',
                organization: {
                  id: 'org_id',
                  slug: 'some-org-slug',
                },
              },
            ],
          },
          touch: vi.fn(),
          getToken: vi.fn(),
        };
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession2] }));
        const sut = new Clerk(productionPublishableKey);
        await sut.load();

        mockSession2.touch.mockImplementationOnce(() => {
          sut.session = mockSession2 as any;
          return Promise.resolve();
        });
        mockSession2.getToken.mockImplementation(() => 'mocked-token');

        await sut.setActive({ organization: 'some-org-slug' });

        await waitFor(() => {
          expect(mockSession2.touch).toHaveBeenCalled();
          expect(mockSession2.getToken).toHaveBeenCalled();
          expect((mockSession2 as any as ActiveSessionResource)?.lastActiveOrganizationId).toEqual('org_id');
          expect(sut.session).toMatchObject(mockSession2);
        });
      });

      it('redirects the user to the /v1/client/touch endpoint if the cookie_expires_at is less than 8 days away', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(
          Promise.resolve({
            signedInSessions: [mockSession],
            cookieExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            isEligibleForTouch: () => true,
            buildTouchUrl: () =>
              `https://clerk.example.com/v1/client/touch?redirect_url=${mockWindowLocation.href}/redirect-url-path`,
          }),
        );

        const sut = new Clerk(productionPublishableKey);
        sut.navigate = vi.fn();
        await sut.load();
        await sut.setActive({
          session: mockSession as any as ActiveSessionResource,
          redirectUrl: '/redirect-url-path',
        });
        const redirectUrl = new URL((sut.navigate as ReturnType<typeof vi.fn>).mock.calls[0][0]);
        expect(redirectUrl.pathname).toEqual('/v1/client/touch');
        expect(redirectUrl.searchParams.get('redirect_url')).toEqual(`${mockWindowLocation.href}/redirect-url-path`);
      });

      it('does not redirect the user to the /v1/client/touch endpoint if the cookie_expires_at is more than 8 days away', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(
          Promise.resolve({
            signedInSessions: [mockSession],
            cookieExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            isEligibleForTouch: () => false,
            buildTouchUrl: () =>
              `https://clerk.example.com/v1/client/touch?redirect_url=${mockWindowLocation.href}/redirect-url-path`,
          }),
        );

        const sut = new Clerk(productionPublishableKey);
        sut.navigate = vi.fn();
        await sut.load();
        await sut.setActive({
          session: mockSession as any as ActiveSessionResource,
          redirectUrl: '/redirect-url-path',
        });
        expect(sut.navigate).toHaveBeenCalledWith('/redirect-url-path');
      });

      it('does not redirect the user to the /v1/client/touch endpoint if the cookie_expires_at is not set', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(
          Promise.resolve({
            signedInSessions: [mockSession],
            cookieExpiresAt: null,
            isEligibleForTouch: () => false,
            buildTouchUrl: () =>
              `https://clerk.example.com/v1/client/touch?redirect_url=${mockWindowLocation.href}/redirect-url-path`,
          }),
        );

        const sut = new Clerk(productionPublishableKey);
        sut.navigate = vi.fn();
        await sut.load();
        await sut.setActive({
          session: mockSession as any as ActiveSessionResource,
          redirectUrl: '/redirect-url-path',
        });
        expect(sut.navigate).toHaveBeenCalledWith('/redirect-url-path');
      });

      it('calls `navigate`', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));
        const navigate = vi.fn();

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as PendingSessionResource, navigate });
        expect(mockSession.touch).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalled();
      });

      mockNativeRuntime(() => {
        it('calls session.touch in a non-standard browser', async () => {
          mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

          const sut = new Clerk(productionPublishableKey);
          await sut.load({ standardBrowser: false });

          const executionOrder: string[] = [];
          mockSession.touch.mockImplementationOnce(() => {
            sut.session = mockSession as any;
            executionOrder.push('session.touch');
            return Promise.resolve();
          });
          const beforeEmitMock = vi.fn().mockImplementationOnce(() => {
            executionOrder.push('before emit');
            return Promise.resolve();
          });

          await sut.setActive({ organization: { id: 'org_id' } as Organization, beforeEmit: beforeEmitMock });

          expect(executionOrder).toEqual(['session.touch', 'before emit']);
          expect(mockSession.touch).toHaveBeenCalled();
          expect((mockSession as any as ActiveSessionResource)?.lastActiveOrganizationId).toEqual('org_id');
          expect(mockSession.getToken).toHaveBeenCalled();
          expect(beforeEmitMock).toHaveBeenCalledWith(mockSession);
          expect(sut.session).toMatchObject(mockSession);
        });
      });
    });

    describe('with `pending` session status', () => {
      const mockSession = {
        id: '1',
        remove: vi.fn(),
        status: 'pending',
        user: {},
        touch: vi.fn(() => Promise.resolve()),
        getToken: vi.fn(),
        lastActiveToken: { getRawString: () => 'mocked-token' },
        tasks: [{ key: 'choose-organization' }],
        currentTask: { key: 'choose-organization' },
        reload: vi.fn(() =>
          Promise.resolve({
            id: '1',
            status: 'pending',
            user: {},
            tasks: [{ key: 'choose-organization' }],
            currentTask: {
              key: 'choose-organization',
            },
          }),
        ),
      };
      let eventBusSpy;

      beforeEach(() => {
        eventBusSpy = vi.spyOn(eventBus, 'emit');
      });

      afterEach(() => {
        mockSession.remove.mockReset();
        mockSession.touch.mockReset();

        eventBusSpy?.mockRestore();
        // cleanup global window pollution
        (window as any).__unstable__onBeforeSetActive = null;
        (window as any).__unstable__onAfterSetActive = null;
      });

      it('calls session.touch by default', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as PendingSessionResource });
        expect(mockSession.touch).toHaveBeenCalled();
      });

      it('does not call __unstable__onBeforeSetActive before session.touch', async () => {
        mockSession.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        const onBeforeSetActive = vi.fn();
        (window as any).__unstable__onBeforeSetActive = onBeforeSetActive;

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as ActiveSessionResource });
        expect(onBeforeSetActive).not.toHaveBeenCalled();
      });

      it('does not call __unstable__onAfterSetActive after session.touch', async () => {
        mockSession.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        const onAfterSetActive = vi.fn();
        (window as any).__unstable__onAfterSetActive = onAfterSetActive;

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as ActiveSessionResource });
        expect(onAfterSetActive).not.toHaveBeenCalled();
      });

      it('navigate to `taskUrl` option', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

        const sut = new Clerk(productionPublishableKey);
        sut.navigate = vi.fn();
        await sut.load({
          taskUrls: {
            'choose-organization': '/choose-organization',
          },
        });
        await sut.setActive({ session: mockSession as any as PendingSessionResource });
        expect(mockSession.touch).toHaveBeenCalled();
        expect(sut.navigate).toHaveBeenCalledWith('/choose-organization');
      });

      it('calls `navigate`', async () => {
        mockSession.touch.mockReturnValue(Promise.resolve());
        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));
        const navigate = vi.fn();

        const sut = new Clerk(productionPublishableKey);
        await sut.load();
        await sut.setActive({ session: mockSession as any as PendingSessionResource, navigate });
        expect(mockSession.touch).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalled();
      });
    });

    describe('with force organization selection enabled', () => {
      const mockSession = {
        id: '1',
        remove: vi.fn(),
        status: 'active',
        user: {},
        touch: vi.fn(() => Promise.resolve()),
        getToken: vi.fn(),
        lastActiveToken: { getRawString: () => 'mocked-token' },
      };

      beforeEach(() => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfig,
            isSingleSession: () => false,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
            organizationSettings: {
              forceOrganizationSelection: true,
            },
          }),
        );
      });

      afterEach(() => {
        mockSession.remove.mockReset();
        mockSession.touch.mockReset();
        mockEnvironmentFetch.mockReset();

        // cleanup global window pollution
        (window as any).__unstable__onBeforeSetActive = null;
        (window as any).__unstable__onAfterSetActive = null;
      });

      it('does not update session to personal workspace', async () => {
        const mockSessionWithOrganization = {
          id: '1',
          status: 'active',
          user: {
            organizationMemberships: [
              {
                id: 'orgmem_id',
                organization: {
                  id: 'org_id',
                  slug: 'some-org-slug',
                },
              },
            ],
          },
          touch: vi.fn(),
          getToken: vi.fn(),
        };

        mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSessionWithOrganization] }));
        const sut = new Clerk(productionPublishableKey);
        await sut.load();

        mockSessionWithOrganization.touch.mockImplementationOnce(() => {
          sut.session = mockSessionWithOrganization as any;
          return Promise.resolve();
        });
        mockSessionWithOrganization.getToken.mockImplementation(() => 'mocked-token');

        await sut.setActive({ organization: 'some-org-slug' });

        await waitFor(() => {
          expect(mockSessionWithOrganization.touch).toHaveBeenCalled();
          expect(mockSessionWithOrganization.getToken).toHaveBeenCalled();
          expect((mockSessionWithOrganization as any as ActiveSessionResource)?.lastActiveOrganizationId).toEqual(
            'org_id',
          );
          expect(sut.session).toMatchObject(mockSessionWithOrganization);
        });

        await sut.setActive({ organization: null });
        expect(sut.session).toMatchObject(mockSessionWithOrganization);
      });
    });
  });

  describe('.load()', () => {
    describe.each(['active', 'pending'] satisfies Array<SignedInSessionResource['status']>)(
      'when session has %s status',
      status => {
        const mockSession = {
          id: '1',
          status,
          user: {},
          getToken: vi.fn(),
          lastActiveToken: { getRawString: () => mockJwt },
        };

        afterEach(() => {
          // cleanup global window pollution
          (window as any).__unstable__onBeforeSetActive = null;
          (window as any).__unstable__onAfterSetActive = null;
        });

        it('gracefully handles an incorrect value returned from the user provided selectInitialSession', async () => {
          mockClientFetch.mockReturnValue(
            Promise.resolve({
              signedInSessions: [],
            }),
          );

          // any is intentional here. We simulate a runtime value that should not exist
          const mockSelectInitialSession = vi.fn(() => undefined) as any;
          const sut = new Clerk(productionPublishableKey);
          await sut.load({
            selectInitialSession: mockSelectInitialSession,
          });

          await waitFor(() => {
            expect(sut.session).not.toBe(undefined);
            expect(sut.session).toBe(null);
          });
        });

        it('updates auth cookie on load from fetched session', async () => {
          mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

          const sut = new Clerk(productionPublishableKey);
          await sut.load();

          expect(document.cookie).toContain(mockJwt);
        });

        it('updates auth cookie on token:update event', async () => {
          mockClientFetch.mockReturnValue(Promise.resolve({ signedInSessions: [mockSession] }));

          const sut = new Clerk(productionPublishableKey);
          await sut.load();

          const token = {
            jwt: {},
            getRawString: () => 'updated-jwt',
          } as TokenResource;
          eventBus.emit(events.TokenUpdate, { token });

          expect(document.cookie).toContain('updated-jwt');
        });
      },
    );
  });

  describe('.signOut()', () => {
    const mockClientDestroy = vi.fn();
    const mockClientRemoveSessions = vi.fn();
    const mockSession1 = { id: '1', remove: vi.fn(), status: 'active', user: {}, getToken: vi.fn() };
    const mockSession2 = { id: '2', remove: vi.fn(), status: 'active', user: {}, getToken: vi.fn() };
    const mockSession3 = { id: '3', remove: vi.fn(), status: 'pending', user: {}, getToken: vi.fn() };

    beforeEach(() => {
      mockClientDestroy.mockReset();
      mockClientRemoveSessions.mockReset();
      mockSession1.remove.mockReset();
      mockSession2.remove.mockReset();
      mockSession3.remove.mockReset();
    });

    it('has no effect if called when no sessions exist', async () => {
      const sut = new Clerk(productionPublishableKey);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          destroy: mockClientDestroy,
        }),
      );
      await sut.load();
      await sut.signOut();
      await waitFor(() => {
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(mockSession1.remove).not.toHaveBeenCalled();
      });
    });

    it('signs out all sessions if no sessionId is passed and multiple sessions have authenticated status', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [mockSession1, mockSession2, mockSession3],
          sessions: [mockSession1, mockSession2, mockSession3],
          destroy: mockClientDestroy,
          removeSessions: mockClientRemoveSessions,
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      sut.navigate = vi.fn();
      await sut.load();
      await sut.signOut();
      await waitFor(() => {
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(mockClientRemoveSessions).toHaveBeenCalled();
        expect(sut.navigate).toHaveBeenCalledWith('/');
      });
    });

    it.each(['active', 'pending'] satisfies Array<SignedInSessionResource['status']>)(
      'signs out all sessions if no sessionId is passed and only one session has %s status',
      async status => {
        mockClientFetch.mockReturnValue(
          Promise.resolve({
            signedInSessions: [{ ...mockSession1, status }],
            sessions: [{ ...mockSession1, status }],
            destroy: mockClientDestroy,
            removeSessions: mockClientRemoveSessions,
          }),
        );

        const sut = new Clerk(productionPublishableKey);
        sut.navigate = vi.fn();
        await sut.load();
        await sut.signOut();
        await waitFor(() => {
          expect(mockClientDestroy).not.toHaveBeenCalled();
          expect(mockClientRemoveSessions).toHaveBeenCalled();
          expect(mockSession1.remove).not.toHaveBeenCalled();
          expect(sut.navigate).toHaveBeenCalledWith('/');
        });
      },
    );

    it('only removes the session that corresponds to the passed sessionId if it is not the current', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [mockSession1, mockSession2, mockSession3],
          sessions: [mockSession1, mockSession2, mockSession3],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      sut.navigate = vi.fn();
      await sut.load();
      await sut.signOut({ sessionId: '2' });
      await waitFor(() => {
        expect(mockSession2.remove).toHaveBeenCalled();
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(sut.navigate).not.toHaveBeenCalled();
      });
    });

    it('removes and signs out the session that corresponds to the passed sessionId if it is the current', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [mockSession1, mockSession2, mockSession3],
          sessions: [mockSession1, mockSession2, mockSession3],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      sut.navigate = vi.fn();
      await sut.load();
      await sut.signOut({ sessionId: '1' });
      await waitFor(() => {
        expect(mockSession1.remove).toHaveBeenCalled();
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(sut.navigate).toHaveBeenCalledWith('/');
      });
    });

    it('removes and signs out the session and redirects to the provided redirectUrl ', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [mockSession1, mockSession2, mockSession3],
          sessions: [mockSession1, mockSession2, mockSession3],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      sut.navigate = vi.fn();
      await sut.load();
      await sut.signOut({ sessionId: '1', redirectUrl: '/after-sign-out' });
      await waitFor(() => {
        expect(mockSession1.remove).toHaveBeenCalled();
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(sut.navigate).toHaveBeenCalledWith('/after-sign-out');
      });
    });
  });

  describe('.navigate(to)', () => {
    let sut: Clerk;
    let logSpy;

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'log').mockReturnValue(void 0);
      sut = new Clerk(productionPublishableKey);
    });

    afterEach(() => {
      logSpy?.mockRestore();
    });

    it('uses window location if a custom navigate is not defined', async () => {
      await sut.load();
      const toUrl = 'http://test.host/';
      await sut.navigate(toUrl);
      expect(mockHref).toHaveBeenCalledWith(toUrl);
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('uses window location if a custom navigate is defined but destination has different origin', async () => {
      await sut.load(mockedLoadOptions);
      const toUrl = 'https://www.origindifferent.com/';
      await sut.navigate(toUrl);
      expect(mockHref).toHaveBeenCalledWith(toUrl);
    });

    it('wraps custom navigate method in a promise if provided and it sync', async () => {
      await sut.load(mockedLoadOptions);
      const toUrl = 'http://test.host/path#hash';
      const res = sut.navigate(toUrl);
      expect(res.then).toBeDefined();
      expect(mockHref).not.toHaveBeenCalled();
      expect(mockNavigate.mock.calls[0][0]).toBe('/path#hash');
    });

    it('logs navigation external navigation when routerDebug is enabled', async () => {
      await sut.load({ routerDebug: true });
      const toUrl = 'http://test.host/';
      await sut.navigate(toUrl);
      expect(mockHref).toHaveBeenCalledWith(toUrl);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(`Clerk is navigating to: ${toUrl}`);
    });

    it('logs navigation custom navigation when routerDebug is enabled', async () => {
      await sut.load({ ...mockedLoadOptions, routerDebug: true });
      const toUrl = 'http://test.host/path#hash';
      const res = sut.navigate(toUrl);
      expect(res.then).toBeDefined();
      expect(mockHref).not.toHaveBeenCalled();
      expect(mockNavigate.mock.calls[0][0]).toBe('/path#hash');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(`Clerk is navigating to: ${toUrl}`);
    });

    it('validates the protocol of the provided URL', async () => {
      await sut.load({ ...mockedLoadOptions, allowedRedirectProtocols: ['gg:'] });
      // allowed protocol
      const toUrl = 'gg://some/deeply/nested/path';
      await sut.navigate(toUrl);
      expect(mockNavigate.mock.calls[0][0]).toBe(toUrl);
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(`Clerk is navigating to: ${toUrl}`);

      mockNavigate.mockReset();
      logSpy.mockReset();

      // disallowed protocol
      const badUrl = 'evil://some/deeply/nested/path';
      await sut.navigate(badUrl);
      expect(mockNavigate.mock.calls[0][0]).toBe('/');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('.handleRedirectCallback()', () => {
    // handleRedirectCallback calls signIn/signUp.reload, which relies on the global fetch instance. We don't actually
    // need a return value though, so we just mock a resolved promise.
    const originalFetch = global.fetch;
    beforeAll(() => {
      global.fetch = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
    });

    afterAll(() => {
      global.fetch = originalFetch;
    });

    beforeEach(() => {
      mockClientFetch.mockReset();
      mockEnvironmentFetch.mockReset();
    });

    describe('with pending session', () => {
      beforeEach(() => {
        mockClientFetch.mockReset();
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfig,
            isSingleSession: () => false,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
            organizationSettings: {
              forceOrganizationSelection: true,
            },
          }),
        );
      });

      it('navigates to task', async () => {
        const mockSession = {
          id: '1',
          status: 'pending',
          user: {},
          tasks: [{ key: 'choose-organization' }],
          currentTask: { key: 'choose-organization' },
          lastActiveToken: { getRawString: () => 'mocked-token' },
        };

        const mockResource = {
          ...mockSession,
          remove: vi.fn(),
          touch: vi.fn(() => Promise.resolve()),
          getToken: vi.fn(),
          reload: vi.fn(() => Promise.resolve(mockSession)),
        };

        mockResource.touch.mockReturnValueOnce(Promise.resolve());
        mockClientFetch.mockReturnValue(
          Promise.resolve({
            signedInSessions: [mockResource],
            signIn: new SignIn(null),
            signUp: new SignUp({
              status: 'complete',
            } as any as SignUpJSON),
            isEligibleForTouch: () => false,
          }),
        );

        const mockSignUpCreate = vi
          .fn()
          .mockReturnValue(Promise.resolve({ status: 'complete', createdSessionId: '123' }));

        const sut = new Clerk(productionPublishableKey);
        await sut.load(mockedLoadOptions);
        if (!sut.client) {
          fail('we should always have a client');
        }
        sut.client.signUp.create = mockSignUpCreate;

        await sut.handleRedirectCallback();

        await waitFor(() => {
          expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up#/tasks/choose-organization');
        });
      });
    });

    it('creates a new user and calls setActive if the user was not found during sso signup', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_identifier',
            first_factor_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: '',
              error: {
                code: 'external_account_not_found',
                long_message: 'The External Account was not found.',
                message: 'Invalid external account',
              },
            },
            second_factor_verification: null,
            identifier: '',
            user_data: null,
            created_session_id: null,
            created_user_id: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSetActive = vi.fn();
      const mockSignUpCreate = vi
        .fn()
        .mockReturnValue(Promise.resolve({ status: 'complete', createdSessionId: '123' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;
      sut.setActive = mockSetActive;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockSetActive).toHaveBeenCalled();
      });
    });

    it('does not initiate the transfer flow when transferable: false is passed', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_identifier',
            first_factor_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: '',
              error: {
                code: 'external_account_not_found',
                long_message: 'The External Account was not found.',
                message: 'Invalid external account',
              },
            },
            second_factor_verification: null,
            identifier: '',
            user_data: null,
            created_session_id: null,
            created_user_id: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSetActive = vi.fn();
      const mockSignUpCreate = vi
        .fn()
        .mockReturnValue(Promise.resolve({ status: 'complete', createdSessionId: '123' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;
      sut.setActive = mockSetActive;

      await sut.handleRedirectCallback({ transferable: false });

      await waitFor(() => {
        expect(mockSignUpCreate).not.toHaveBeenCalledWith({ transfer: true });
        expect(mockSetActive).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/sign-in', {
          windowNavigate: expect.any(Function),
        });
      });
    });

    it('creates a new sign up and navigates to the continue sign-up path if the user was not found during sso signup and there are missing requirements', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_identifier',
            first_factor_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: '',
              error: {
                code: 'external_account_not_found',
                long_message: 'The External Account was not found.',
                message: 'Invalid external account',
              },
            },
            second_factor_verification: null,
            identifier: '',
            user_data: null,
            created_session_id: null,
            created_user_id: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSignUpCreate = vi.fn().mockReturnValue(
        Promise.resolve(
          new SignUp({
            status: 'missing_requirements',
            missing_fields: ['phone_number'],
          } as any as SignUpJSON),
        ),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up#/continue');
      });
    });

    it('signs the user in if the user was found during sign up', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'transferable',
                strategy: 'oauth_google',
                external_verification_redirect_url: null,
                error: {
                  code: 'external_account_exists',
                  long_message: 'This external account already exists.',
                  message: 'already exists',
                },
              },
            },
            external_account: null,
            external_account_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: {
                code: 'external_account_exists',
                long_message: 'This external account already exists.',
                message: 'already exists',
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const mockSetActive = vi.fn();
      const mockSignInCreate = vi
        .fn()
        .mockReturnValue(Promise.resolve({ status: 'complete', createdSessionId: '123' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signIn.create = mockSignInCreate;
      sut.setActive = mockSetActive;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignInCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockSetActive).toHaveBeenCalled();
      });
    });

    it('signs the user by calling setActive if the user was already signed in during sign up', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            missing_fields: [],
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'identifier_already_signed_in',
                  long_message: "You're already signed in",
                  message: "You're already signed in",
                  meta: {
                    session_id: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
                  },
                },
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const mockSetActive = vi.fn();
      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalled();
      });
    });

    it('creates a new user and calls setActive in if the user was found during sign in', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_identifier',
            first_factor_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: {
                code: 'external_account_not_found',
                long_message: 'The External Account was not found.',
                message: 'Invalid external account',
              },
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSetActive = vi.fn();
      const mockSignUpCreate = vi
        .fn()
        .mockReturnValue(Promise.resolve({ status: 'complete', createdSessionId: '123' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;
      sut.setActive = mockSetActive;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockSetActive).toHaveBeenCalled();
      });
    });

    it('redirects an existing user to the default 2fa page if 2fa is enabled during sign in', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_second_factor',
            first_factor_verification: {
              status: 'verified',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: null,
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-in#/factor-two');
      });
    });

    it('redirects an existing user to a custom 2fa page if 2fa is enabled and secondFactorUrl is passed during sign in', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_second_factor',
            first_factor_verification: {
              status: 'verified',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: null,
              expire_at: 1631777672389,
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback({
        secondFactorUrl: '/custom-2fa',
      });

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/custom-2fa');
      });
    });

    it('redirects the user to the signInForceRedirectUrl if one was provided', async () => {
      const sessionId = 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe';
      const mockSession = {
        id: sessionId,
        remove: vi.fn(),
        status: 'active',
        user: {},
        touch: vi.fn(() => Promise.resolve()),
        getToken: vi.fn(),
        lastActiveToken: { getRawString: () => 'mocked-token' },
      };
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          sessions: [mockSession],
          signedInSessions: [mockSession],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'identifier_already_signed_in',
                  long_message: "You're already signed in",
                  message: "You're already signed in",
                  meta: {
                    session_id: sessionId,
                  },
                },
              },
            },
          } as any as SignUpJSON),
          isEligibleForTouch: () => false,
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      await sut.handleRedirectCallback({
        signInForceRedirectUrl: '/custom-sign-in',
      });

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/custom-sign-in');
      });
    });

    it('gives priority to signInForceRedirectUrl if signInForceRedirectUrl and signInFallbackRedirectUrl were provided ', async () => {
      const sessionId = 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe';
      const mockSession = {
        id: sessionId,
        remove: vi.fn(),
        status: 'active',
        user: {},
        touch: vi.fn(() => Promise.resolve()),
        getToken: vi.fn(),
        lastActiveToken: { getRawString: () => 'mocked-token' },
      };
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          sessions: [mockSession],
          signedInSessions: [mockSession],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'identifier_already_signed_in',
                  long_message: "You're already signed in",
                  message: "You're already signed in",
                  meta: {
                    session_id: sessionId,
                  },
                },
              },
            },
          } as any as SignUpJSON),
          isEligibleForTouch: () => false,
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback({
        signInForceRedirectUrl: '/custom-sign-in',
        signInFallbackRedirectUrl: '/redirect-to',
      } as any);

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/custom-sign-in');
      });
    });

    it('redirects user to signUp url if there is an external account signup attempt has an error', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'external_account_not_found',
                  long_message: 'The External Account was not found.',
                  message: 'Invalid external account',
                  meta: {
                    session_id: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
                  },
                },
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up');
      });
    });

    it('redirects user to signUp url if there is an external account signup error even if missing requirements', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'verified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'not_allowed_to_sign_up',
                  long_message: 'You cannot sign up with test@clerk.com since this is a restricted application.',
                  message: 'Not allowed to sign up',
                  meta: {
                    session_id: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
                  },
                },
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up');
      });
    });

    it('redirects user to the continue sign-up url if the external account was verified but there are still missing requirements', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            missing_fields: ['last_name'],
            verifications: {
              external_account: {
                status: 'verified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: null,
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up#/continue');
      });
    });

    it('redirects user to the verify-email-address url if the external account has unverified email and there are no missing requirements', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            missing_fields: [],
            unverified_fields: ['email_address'],
            verifications: {
              email_address: {
                status: 'unverified',
                strategy: 'from_oauth_google',
                next_action: 'needs_attempt',
              },
              external_account: {
                status: 'verified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: null,
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up#/verify-email-address');
      });
    });

    it('redirects user to factor-one, if the email is claimed, but the external account has an unverified email', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_first_factor',
          } as unknown as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-in#/factor-one');
      });
    });

    it('redirects user to factor-one, if we are doing a account transfer and the external account has an unverified email', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            missing_fields: [],
            unverified_fields: ['email_address'],
            verifications: {
              external_account: {
                status: 'transferable',
                error: {
                  code: 'external_account_exists',
                },
              },
            },
          } as unknown as SignUpJSON),
        }),
      );

      const mockSignInCreate = vi.fn().mockReturnValue(Promise.resolve({ status: 'needs_first_factor' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signIn.create = mockSignInCreate;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-in#/factor-one');
      });
    });

    it('redirects to sign-up if an oauth flow fails due to the user being locked', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            missing_fields: [],
            unverified_fields: ['email_address'],
            verifications: {
              external_account: {
                status: 'unverified',
                error: {
                  error: {
                    code: 'user_locked',
                    long_message: 'Your account is locked. Please contact yolo@swag.com for more information.',
                    message: 'Account locked',
                  },
                },
              },
            },
          } as unknown as SignUpJSON),
        }),
      );

      const mockSignUpCreate = vi.fn().mockReturnValue(
        Promise.resolve(
          new SignUp({
            status: 'missing_requirements',
            missing_fields: ['phone_number'],
          } as any as SignUpJSON),
        ),
      );

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-up');
      });
    });

    it('redirects to sign-in if an oauth flows fails due to the user being locked', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_first_factor',
            first_factor_verification: {
              status: 'unverified',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: {
                code: 'user_locked',
                long_message: 'Your account is locked. Please contact yolo@swag.com for more information.',
                message: 'Account locked',
              },
              expire_at: 1631777672389,
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSignInCreate = vi.fn().mockReturnValue(Promise.resolve({ status: 'needs_first_factor' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signIn.create = mockSignInCreate;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-in');
      });
    });

    it('redirects user to reset-password, if the user is required to set a new password', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          signIn: new SignIn({
            status: 'needs_new_password',
          } as unknown as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSignInCreate = vi.fn().mockReturnValue(Promise.resolve({ status: 'needs_new_password' }));

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signIn.create = mockSignInCreate;

      await sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate.mock.calls[0][0]).toBe('/sign-in#/reset-password');
      });
    });
  });

  describe('.handleEmailLinkVerification()', () => {
    beforeEach(() => {
      mockClientFetch.mockReset();
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );
    });

    it('completes the sign in flow if a session was created on this client', async () => {
      const createdSessionId = 'sess_123';
      setWindowQueryParams([
        ['__clerk_status', 'verified'],
        ['__clerk_created_session', createdSessionId],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [{ id: createdSessionId }],
          signIn: new SignIn({
            status: 'completed',
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );
      const mockSetActive = vi.fn();

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      const redirectUrlComplete = '/redirect-to';
      await sut.handleEmailLinkVerification({ redirectUrlComplete });

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({
          session: createdSessionId,
          redirectUrl: redirectUrlComplete,
        });
      });
    });

    it("continues to redirectUrl for sign in that's not completed", async () => {
      setWindowQueryParams([['__clerk_status', 'verified']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          signIn: new SignIn({
            status: 'needs_second_factor',
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );
      const mockSetActive = vi.fn();

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      const redirectUrl = '/2fa';
      sut.handleEmailLinkVerification({ redirectUrl });

      await waitFor(() => {
        expect(mockSetActive).not.toHaveBeenCalled();
        expect(mockNavigate.mock.calls[0][0]).toBe(redirectUrl);
      });
    });

    it('completes the sign up flow if a session was created on this client', async () => {
      const createdSessionId = 'sess_123';
      setWindowQueryParams([
        ['__clerk_status', 'verified'],
        ['__clerk_created_session', createdSessionId],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [{ id: createdSessionId }],
          signUp: new SignUp({
            status: 'completed',
          } as any as SignUpJSON),
          signIn: new SignIn(null),
        }),
      );
      const mockSetActive = vi.fn();

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      const redirectUrlComplete = '/redirect-to';
      await sut.handleEmailLinkVerification({ redirectUrlComplete });

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({
          session: createdSessionId,
          redirectUrl: redirectUrlComplete,
        });
      });
    });

    it("continues the sign up flow for a sign up that's not completed", async () => {
      setWindowQueryParams([['__clerk_status', 'verified']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          signUp: new SignUp({
            status: 'missing_requirements',
          } as any as SignUpJSON),
          signIn: new SignIn(null),
        }),
      );
      const mockSetActive = vi.fn();

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      const redirectUrl = '/next-up';
      sut.handleEmailLinkVerification({ redirectUrl });

      await waitFor(() => {
        expect(mockSetActive).not.toHaveBeenCalled();
        expect(mockNavigate.mock.calls[0][0]).toBe(redirectUrl);
      });
    });

    it('throws an error for expired verification status parameter', async () => {
      setWindowQueryParams([['__clerk_status', 'expired']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetActive = vi.fn();

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      await expect(async () => {
        await sut.handleEmailLinkVerification({});
      }).rejects.toThrow(EmailLinkErrorCodeStatus.Expired);
      expect(mockSetActive).not.toHaveBeenCalled();
    });

    it('throws an error for failed verification status parameter', async () => {
      setWindowQueryParams([['__clerk_status', 'failed']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetActive = vi.fn();

      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      await expect(async () => {
        await sut.handleEmailLinkVerification({});
      }).rejects.toThrow(EmailLinkErrorCodeStatus.Failed);
      expect(mockSetActive).not.toHaveBeenCalled();
    });

    it('runs a callback when verified on other device', async () => {
      setWindowQueryParams([
        ['__clerk_status', 'verified'],
        ['__clerk_created_session', 'sess_123'],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetActive = vi.fn();
      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;
      const res = { ping: 'ping' };
      const cb = () => {
        res.ping = 'pong';
      };
      await sut.handleEmailLinkVerification({ onVerifiedOnOtherDevice: cb });
      expect(res.ping).toEqual('pong');
      expect(mockSetActive).not.toHaveBeenCalled();
    });

    it('throws an error with no status query parameter', async () => {
      setWindowQueryParams([['__clerk_created_session', 'sess_123']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetActive = vi.fn();
      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;
      await expect(async () => {
        await sut.handleEmailLinkVerification({});
      }).rejects.toThrow(EmailLinkErrorCodeStatus.Failed);
      expect(mockSetActive).not.toHaveBeenCalled();
    });

    it('throws an error for invalid status query parameter', async () => {
      setWindowQueryParams([
        ['__clerk_status', 'whatever'],
        ['__clerk_created_session', 'sess_123'],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          signedInSessions: [],
          sessions: [{ id: 'sess_123' }],
          signIn: new SignIn({
            status: 'completed',
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );
      const mockSetActive = vi.fn();
      const sut = new Clerk(productionPublishableKey);
      await sut.load(mockedLoadOptions);
      sut.setActive = mockSetActive;

      await expect(async () => {
        await sut.handleEmailLinkVerification({});
      }).rejects.toThrow(EmailLinkErrorCodeStatus.Failed);
      expect(mockSetActive).not.toHaveBeenCalled();
    });
  });

  /**
   * TODO:
   * 1) Write better test names for this.domain and this.isSatellite
   * 2) Write test for when to throw errors in proxy url and multi-domain prod
   * 3) Write test the mimic sync/link in prod
   */
  describe('Clerk().isSatellite and Clerk().domain getters', () => {
    beforeEach(() => {
      mockClientFetch.mockReset();
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );
    });

    it('domain is string, isSatellite is true', async () => {
      const sut = new Clerk(productionPublishableKey, {
        domain: 'example.com',
      });

      await sut.load({
        isSatellite: true,
      });

      expect(sut.domain).toBe('clerk.example.com');
      expect(sut.isSatellite).toBe(true);
    });

    it('domain is string, isSatellite is function returning true', async () => {
      const sut = new Clerk(productionPublishableKey, {
        domain: 'example.com',
      });

      await sut.load({
        isSatellite: url => url.host === 'test.host',
      });

      expect(sut.domain).toBe('clerk.example.com');
      expect(sut.isSatellite).toBe(true);
    });

    it('domain is string with scheme and clerk prefix, isSatellite is true', async () => {
      const sut = new Clerk(productionPublishableKey, {
        domain: 'https://clerk.example.com',
      });

      await sut.load({
        isSatellite: true,
      });

      expect(sut.domain).toBe('clerk.example.com');
      expect(sut.isSatellite).toBe(true);
    });

    it('domain is function that returns the url of the website, isSatellite is true', async () => {
      const sut = new Clerk(productionPublishableKey, {
        domain: url => url.href.replace(/\/$/, ''),
      });

      await sut.load({
        isSatellite: true,
      });

      expect(sut.domain).toBe('clerk.test.host');
      expect(sut.isSatellite).toBe(true);
    });
  });

  describe('Clerk multi-domain', () => {
    describe('when development satellite', () => {
      it('fapiClient should not use Clerk.domain as its baseUrl', async () => {
        const sut = new Clerk(developmentPublishableKey, {
          domain: 'satellite.dev',
        });
        await sut.load({
          isSatellite: true,
          signInUrl: 'https://primary.dev/sign-in',
        });

        expect(sut.getFapiClient().buildUrl({ path: '/me' }).href).toContain(`https://${sut.frontendApi}/v1/me`);
      });
    });

    describe('when production satellite', () => {
      test('fapiClient should use Clerk.domain as its baseUrl', async () => {
        const sut = new Clerk(productionPublishableKey, {
          domain: 'satellite.com',
        });
        await sut.load({
          isSatellite: true,
        });

        expect(sut.getFapiClient().buildUrl({ path: '/me' }).href).toContain('https://clerk.satellite.com/v1/me');
      });
    });
  });

  describe('proxyUrl', () => {
    describe('when proxyUrl is set', () => {
      test('fapiClient should use Clerk.proxyUrl as its baseUrl', async () => {
        const sut = new Clerk(productionPublishableKey, {
          proxyUrl: 'https://proxy.com/api/__clerk',
        });
        await sut.load({});

        expect(sut.getFapiClient().buildUrl({ path: '/me' }).href).toContain('https://proxy.com/api/__clerk/v1/me');
      });
    });
  });

  describe('buildUrlWithAuth', () => {
    it('builds an absolute url from a relative url in development', async () => {
      const sut = new Clerk(developmentPublishableKey);
      await sut.load();

      const url = sut.buildUrlWithAuth('foo');
      expect(url).toBe('http://test.host/foo');
    });

    it('returns what was passed when in production', async () => {
      const sut = new Clerk(productionPublishableKey);
      await sut.load();

      const url = sut.buildUrlWithAuth('foo');
      expect(url).toBe('foo');
    });

    it('uses the hash to propagate the dev_browser JWT by default on dev', async () => {
      const sut = new Clerk(developmentPublishableKey);
      await sut.load();

      const url = sut.buildUrlWithAuth('https://example.com/some-path');
      expect(url).toBe('https://example.com/some-path?__clerk_db_jwt=deadbeef');
    });

    it('uses the query param to propagate the dev_browser JWT if specified by option on dev', async () => {
      const sut = new Clerk(developmentPublishableKey);
      await sut.load();

      const url = sut.buildUrlWithAuth('https://example.com/some-path');
      expect(url).toBe('https://example.com/some-path?__clerk_db_jwt=deadbeef');
    });

    it('uses the query param to propagate the dev_browser JWT to Account Portal pages on dev - non-kima', async () => {
      const sut = new Clerk(developmentPublishableKey);
      await sut.load();

      const url = sut.buildUrlWithAuth('https://accounts.abcef.12345.dev.lclclerk.com');
      expect(url).toBe('https://accounts.abcef.12345.dev.lclclerk.com/?__clerk_db_jwt=deadbeef');
    });

    it('uses the query param to propagate the dev_browser JWT to Account Portal pages on dev - kima', async () => {
      const sut = new Clerk(developmentPublishableKey);
      await sut.load();

      const url = sut.buildUrlWithAuth('https://rested-anemone-14.accounts.dev');
      expect(url).toBe('https://rested-anemone-14.accounts.dev/?__clerk_db_jwt=deadbeef');
    });
  });

  describe('Organizations', () => {
    it('getOrganization', async () => {
      // @ts-expect-error - Mocking a protected method
      BaseResource._fetch = vi.fn().mockResolvedValue({});
      const sut = new Clerk(developmentPublishableKey);

      await sut.getOrganization('org_id');

      // @ts-expect-error - Mocking a protected method
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'GET',
        path: '/organizations/org_id',
      });
    });
  });

  describe('updateClient', () => {
    afterEach(() => {
      // cleanup global window pollution
      (window as any).__unstable__onBeforeSetActive = null;
      (window as any).__unstable__onAfterSetActive = null;
    });

    it('runs server revalidation hooks when session transitions from `active` to `pending`', async () => {
      const mockOnBeforeSetActive = vi.fn().mockReturnValue(Promise.resolve());
      const mockOnAfterSetActive = vi.fn().mockReturnValue(Promise.resolve());
      (window as any).__unstable__onBeforeSetActive = mockOnBeforeSetActive;
      (window as any).__unstable__onAfterSetActive = mockOnAfterSetActive;

      const mockActiveSession = {
        id: 'session_1',
        status: 'active',
        user: { id: 'user_1' },
        lastActiveToken: { getRawString: () => 'token_1' },
      };

      const mockPendingSession = {
        id: 'session_1',
        status: 'pending',
        user: { id: 'user_1' },
        lastActiveToken: { getRawString: () => 'token_1' },
      };

      const mockInitialClient = {
        sessions: [mockActiveSession],
        signedInSessions: [mockActiveSession],
        lastActiveSessionId: 'session_1',
      };

      const mockUpdatedClient = {
        sessions: [mockPendingSession],
        signedInSessions: [mockPendingSession],
        lastActiveSessionId: 'session_1',
      };

      const sut = new Clerk(productionPublishableKey);

      // Manually set the initial client and session state to simulate active session
      // without going through load() or setActive()
      sut.updateClient(mockInitialClient as any);

      // Verify we start with an active session
      expect(sut.session?.status).toBe('active');

      // Call updateClient with the new client that has pending session
      sut.updateClient(mockUpdatedClient as any);

      // Verify hooks were called
      await waitFor(() => {
        expect(mockOnAfterSetActive).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('__internal_attemptToEnableEnvironmentSetting', () => {
    describe('for organizations', () => {
      it('does not open prompt if organizations is enabled in development', async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfig,
            isSingleSession: () => false,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
            organizationSettings: {
              enabled: true,
            },
          }),
        );

        const sut = new Clerk(productionPublishableKey);

        const __internal_openEnableOrganizationsPromptSpy = vi.fn();
        sut.__internal_openEnableOrganizationsPrompt = __internal_openEnableOrganizationsPromptSpy;

        await sut.load();

        const result = await sut.__internal_attemptToEnableEnvironmentSetting({
          for: 'organizations',
          caller: 'OrganizationSwitcher',
        });

        expect(result?.isEnabled).toBe(true);
        expect(__internal_openEnableOrganizationsPromptSpy).not.toHaveBeenCalled();
      });

      it('does not open prompt if organizations is enabled in production', async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfig,
            isSingleSession: () => false,
            isProduction: () => true,
            isDevelopmentOrStaging: () => true,
            organizationSettings: {
              enabled: true,
            },
          }),
        );

        const sut = new Clerk(productionPublishableKey);

        const __internal_openEnableOrganizationsPromptSpy = vi.fn();
        sut.__internal_openEnableOrganizationsPrompt = __internal_openEnableOrganizationsPromptSpy;

        await sut.load();

        const result = await sut.__internal_attemptToEnableEnvironmentSetting({
          for: 'organizations',
          caller: 'OrganizationSwitcher',
        });

        expect(result?.isEnabled).toBe(true);
        expect(__internal_openEnableOrganizationsPromptSpy).not.toHaveBeenCalled();
      });

      it('opens prompt if organizations is disabled in development', async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfig,
            isSingleSession: () => false,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
            organizationSettings: {
              enabled: false,
            },
          }),
        );

        const sut = new Clerk(developmentPublishableKey);

        const __internal_openEnableOrganizationsPromptSpy = vi.fn();
        sut.__internal_openEnableOrganizationsPrompt = __internal_openEnableOrganizationsPromptSpy;

        await sut.load();

        const result = await sut.__internal_attemptToEnableEnvironmentSetting({
          for: 'organizations',
          caller: 'OrganizationSwitcher',
        });

        expect(result?.isEnabled).toBe(false);
        expect(__internal_openEnableOrganizationsPromptSpy).toHaveBeenCalled();
      });

      it('does not open prompt if organizations is disabled in production', async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfig,
            isSingleSession: () => false,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
            organizationSettings: {
              enabled: false,
            },
          }),
        );

        const sut = new Clerk(productionPublishableKey);

        const __internal_openEnableOrganizationsPromptSpy = vi.fn();
        sut.__internal_openEnableOrganizationsPrompt = __internal_openEnableOrganizationsPromptSpy;

        await sut.load();

        const result = await sut.__internal_attemptToEnableEnvironmentSetting({
          for: 'organizations',
          caller: 'OrganizationSwitcher',
        });

        expect(result?.isEnabled).toBe(false);
        expect(__internal_openEnableOrganizationsPromptSpy).not.toHaveBeenCalled();
      });
    });
  });
});
