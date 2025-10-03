import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DevBrowser } from '../auth/devBrowser';
import { Clerk } from '../clerk';
import type { DisplayConfig } from '../resources/internal';
import { Client, Environment } from '../resources/internal';

const mockClientFetch = vi.fn();
const mockEnvironmentFetch = vi.fn();

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

const mockDisplayConfigWithSameOrigin = {
  signInUrl: 'http://test.host/sign-in',
  signUpUrl: 'http://test.host/sign-up',
  userProfileUrl: 'http://test.host/user-profile',
  homeUrl: 'http://test.host/home',
  createOrganizationUrl: 'http://test.host/create-organization',
  organizationProfileUrl: 'http://test.host/organization-profile',
  waitlistUrl: 'http://test.host/waitlist',
} as DisplayConfig;

const mockDisplayConfigWithDifferentOrigin = {
  signInUrl: 'http://another-test.host/sign-in',
  signUpUrl: 'http://another-test.host/sign-up',
  userProfileUrl: 'http://another-test.host/user-profile',
  homeUrl: 'http://another-test.host/home',
  createOrganizationUrl: 'http://another-test.host/create-organization',
  organizationProfileUrl: 'http://another-test.host/organization-profile',
  waitlistUrl: 'http://another-test.host/waitlist',
} as DisplayConfig;

const mockUserSettings = {
  signUp: {
    captcha_enabled: false,
  },
};

const developmentPublishableKey = 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ';
const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

describe('Clerk singleton - Redirects', () => {
  const mockNavigate = vi.fn((to: string) => Promise.resolve(to));
  const mockedLoadOptions = { routerPush: mockNavigate, routerReplace: mockNavigate };

  let mockWindowLocation;
  let mockHref: vi.Mock;

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
    } as any;

    Object.defineProperty(global.window, 'location', { value: mockWindowLocation });
  });

  afterAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: oldWindowLocation,
    });
  });

  beforeEach(() => {
    mockClientFetch.mockReturnValue(
      Promise.resolve({
        signedInSessions: [],
      }),
    );
  });

  afterEach(() => mockNavigate.mockReset());

  describe('.redirectTo(SignUp|SignIn|UserProfile|AfterSignIn|AfterSignUp|CreateOrganization|OrganizationProfile|Waitlist)', () => {
    let clerkForProductionInstance: Clerk;
    let clerkForDevelopmentInstance: Clerk;

    describe('when redirects point to same origin urls', () => {
      beforeEach(async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfigWithSameOrigin,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
          }),
        );

        clerkForProductionInstance = new Clerk(productionPublishableKey);
        clerkForDevelopmentInstance = new Clerk(developmentPublishableKey);

        await clerkForProductionInstance.load(mockedLoadOptions);
        await clerkForDevelopmentInstance.load(mockedLoadOptions);
      });

      afterEach(() => {
        mockEnvironmentFetch.mockRestore();
      });

      it('redirects to signInUrl for development instance', async () => {
        await clerkForDevelopmentInstance.redirectToSignIn({ redirectUrl: '/example' });
        expect(mockNavigate).toHaveBeenCalledWith('/sign-in#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample', {
          windowNavigate: expect.any(Function),
        });
      });

      it('redirects to signInUrl for production instance', async () => {
        await clerkForProductionInstance.redirectToSignIn({ redirectUrl: '/example' });
        expect(mockNavigate).toHaveBeenCalledWith('/sign-in#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample', {
          windowNavigate: expect.any(Function),
        });
      });

      it('redirects to signUpUrl for development instance', async () => {
        await clerkForDevelopmentInstance.redirectToSignUp({ redirectUrl: '/example' });
        expect(mockNavigate).toHaveBeenCalledWith('/sign-up#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample', {
          windowNavigate: expect.any(Function),
        });
      });

      it('redirects to signUpUrl for production instance', async () => {
        await clerkForProductionInstance.redirectToSignUp({ redirectUrl: '/example' });
        expect(mockNavigate).toHaveBeenCalledWith('/sign-up#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample', {
          windowNavigate: expect.any(Function),
        });
      });

      it('redirects to userProfileUrl', async () => {
        await clerkForProductionInstance.redirectToUserProfile();
        await clerkForDevelopmentInstance.redirectToUserProfile();

        expect(mockNavigate.mock.calls[0][0]).toBe('/user-profile');
        expect(mockNavigate.mock.calls[1][0]).toBe('/user-profile');
      });

      it('redirects to afterSignUp', async () => {
        await clerkForProductionInstance.redirectToAfterSignUp();
        await clerkForDevelopmentInstance.redirectToAfterSignUp();

        expect(mockNavigate.mock.calls[0][0]).toBe('/');
        expect(mockNavigate.mock.calls[1][0]).toBe('/');
      });

      it('redirects to afterSignIn', async () => {
        await clerkForProductionInstance.redirectToAfterSignIn();
        await clerkForDevelopmentInstance.redirectToAfterSignIn();

        expect(mockNavigate.mock.calls[0][0]).toBe('/');
        expect(mockNavigate.mock.calls[1][0]).toBe('/');
      });

      it('redirects to create organization', async () => {
        await clerkForProductionInstance.redirectToCreateOrganization();
        await clerkForDevelopmentInstance.redirectToCreateOrganization();

        expect(mockNavigate.mock.calls[0][0]).toBe('/create-organization');
        expect(mockNavigate.mock.calls[1][0]).toBe('/create-organization');
      });

      it('redirects to organization profile', async () => {
        await clerkForProductionInstance.redirectToOrganizationProfile();
        await clerkForDevelopmentInstance.redirectToOrganizationProfile();

        expect(mockNavigate.mock.calls[0][0]).toBe('/organization-profile');
        expect(mockNavigate.mock.calls[1][0]).toBe('/organization-profile');
      });

      it('redirects to waitlitUrl', async () => {
        await clerkForDevelopmentInstance.redirectToWaitlist();
        expect(mockNavigate).toHaveBeenCalledWith('/waitlist', {
          windowNavigate: expect.any(Function),
        });
      });
    });

    describe('when redirects point to different origin urls', () => {
      beforeEach(async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfigWithDifferentOrigin,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
          }),
        );

        clerkForProductionInstance = new Clerk(productionPublishableKey);
        clerkForDevelopmentInstance = new Clerk(developmentPublishableKey);

        await clerkForProductionInstance.load(mockedLoadOptions);
        await clerkForDevelopmentInstance.load(mockedLoadOptions);
      });

      afterEach(() => {
        mockEnvironmentFetch.mockRestore();
      });

      const host = 'http://another-test.host';

      it('redirects to signInUrl for development instance', async () => {
        await clerkForDevelopmentInstance.redirectToSignIn({ redirectUrl: '/example' });
        expect(mockHref).toHaveBeenCalledTimes(1);
        expect(mockHref).toHaveBeenCalledWith(
          `${host}/sign-in?__clerk_db_jwt=deadbeef#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample`,
        );
      });

      it('redirects to signInUrl for production instance', async () => {
        await clerkForProductionInstance.redirectToSignIn({ redirectUrl: '/example' });
        expect(mockHref).toHaveBeenCalledTimes(1);
        expect(mockHref).toHaveBeenCalledWith(`${host}/sign-in#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample`);
      });

      it('redirects to signUpUrl for development instance', async () => {
        await clerkForDevelopmentInstance.redirectToSignUp({ redirectUrl: '/example' });
        expect(mockHref).toHaveBeenCalledTimes(1);
        expect(mockHref).toHaveBeenCalledWith(
          `${host}/sign-up?__clerk_db_jwt=deadbeef#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample`,
        );
      });

      it('redirects to signUpUrl for production instance', async () => {
        await clerkForProductionInstance.redirectToSignUp({ redirectUrl: '/example' });
        expect(mockHref).toHaveBeenCalledTimes(1);
        expect(mockHref).toHaveBeenCalledWith(`${host}/sign-up#/?redirect_url=http%3A%2F%2Ftest.host%2Fexample`);
      });

      it('redirects to userProfileUrl', async () => {
        await clerkForProductionInstance.redirectToUserProfile();
        await clerkForDevelopmentInstance.redirectToUserProfile();

        expect(mockHref).toHaveBeenNthCalledWith(1, `${host}/user-profile`);
        expect(mockHref).toHaveBeenNthCalledWith(2, `${host}/user-profile?__clerk_db_jwt=deadbeef`);
      });

      it('redirects to create organization', async () => {
        await clerkForProductionInstance.redirectToCreateOrganization();
        await clerkForDevelopmentInstance.redirectToCreateOrganization();

        expect(mockHref).toHaveBeenNthCalledWith(1, `${host}/create-organization`);
        expect(mockHref).toHaveBeenNthCalledWith(2, `${host}/create-organization?__clerk_db_jwt=deadbeef`);
      });

      it('redirects to organization profile', async () => {
        await clerkForProductionInstance.redirectToOrganizationProfile();
        await clerkForDevelopmentInstance.redirectToOrganizationProfile();

        expect(mockHref).toHaveBeenNthCalledWith(1, `${host}/organization-profile`);
        expect(mockHref).toHaveBeenNthCalledWith(2, `${host}/organization-profile?__clerk_db_jwt=deadbeef`);
      });
    });
  });

  describe('.redirectWithAuth(url)', () => {
    let clerkForProductionInstance: Clerk;
    let clerkForDevelopmentInstance: Clerk;

    beforeEach(async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfigWithDifferentOrigin,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      clerkForProductionInstance = new Clerk(productionPublishableKey);
      clerkForDevelopmentInstance = new Clerk(developmentPublishableKey);

      await clerkForProductionInstance.load(mockedLoadOptions);
      await clerkForDevelopmentInstance.load(mockedLoadOptions);
    });

    const host = 'https://app.example.com';

    it('redirects to the provided url with __clerk_db_jwt in the url', async () => {
      await clerkForProductionInstance.redirectWithAuth(host);
      await clerkForDevelopmentInstance.redirectWithAuth(host);

      expect(mockHref).toHaveBeenNthCalledWith(1, `${host}/`);
      expect(mockHref).toHaveBeenNthCalledWith(2, `${host}/?__clerk_db_jwt=deadbeef`);
    });
  });
});
