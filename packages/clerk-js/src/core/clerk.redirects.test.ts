import { Clerk } from './clerk';
import type { AuthConfig, DisplayConfig } from './resources/internal';
import { Client, Environment } from './resources/internal';

const mockClientFetch = jest.fn();
const mockEnvironmentFetch = jest.fn();
const mockUsesUrlBasedSessionSync = jest.fn();

jest.mock('./resources/Client');
jest.mock('./resources/Environment');

// Because Jest, don't ask me why...
jest.mock('./devBrowser', () => ({
  createDevBrowser: () => ({
    clear: jest.fn(),
    setup: jest.fn(),
    getDevBrowserJWT: jest.fn(() => 'deadbeef'),
    setDevBrowserJWT: jest.fn(),
    removeDevBrowserJWT: jest.fn(),
  }),
}));

Client.getInstance = jest.fn().mockImplementation(() => {
  return { fetch: mockClientFetch };
});
Environment.getInstance = jest.fn().mockImplementation(() => {
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
} as DisplayConfig;

const mockDisplayConfigWithDifferentOrigin = {
  signInUrl: 'http://another-test.host/sign-in',
  signUpUrl: 'http://another-test.host/sign-up',
  userProfileUrl: 'http://another-test.host/user-profile',
  homeUrl: 'http://another-test.host/home',
  createOrganizationUrl: 'http://another-test.host/create-organization',
  organizationProfileUrl: 'http://another-test.host/organization-profile',
} as DisplayConfig;

const mockUserSettings = {
  signUp: {
    captcha_enabled: false,
  },
};

const developmentPublishableKey = 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ';
const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

describe('Clerk singleton - Redirects', () => {
  let mockNavigate = jest.fn();
  let mockWindowLocation;
  let mockHref: jest.Mock;

  beforeEach(() => {
    mockHref = jest.fn();
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
        activeSessions: [],
      }),
    );

    mockNavigate = jest.fn((to: string) => Promise.resolve(to));
  });

  describe('.redirectTo(SignUp|SignIn|UserProfile|AfterSignIn|AfterSignUp|CreateOrganization|OrganizationProfile)', () => {
    let clerkForProductionInstance: Clerk;
    let clerkForDevelopmentInstance: Clerk;

    describe('when redirects point to same origin urls', () => {
      beforeEach(async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            authConfig: { urlBasedSessionSyncing: true } as AuthConfig,
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfigWithSameOrigin,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
          }),
        );

        mockUsesUrlBasedSessionSync.mockReturnValue(true);

        clerkForProductionInstance = new Clerk(productionPublishableKey);
        await clerkForProductionInstance.load({
          routerPush: mockNavigate,
        });

        clerkForDevelopmentInstance = new Clerk(developmentPublishableKey);
        await clerkForDevelopmentInstance.load({
          routerPush: mockNavigate,
        });
      });

      afterEach(() => {
        mockEnvironmentFetch.mockRestore();
      });

      it('redirects to signInUrl', async () => {
        await clerkForProductionInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');

        await clerkForDevelopmentInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');
      });

      it('redirects to signUpUrl', async () => {
        await clerkForProductionInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');

        await clerkForDevelopmentInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');
      });

      it('redirects to userProfileUrl', async () => {
        await clerkForProductionInstance.redirectToUserProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/user-profile');

        await clerkForDevelopmentInstance.redirectToUserProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/user-profile');
      });

      it('redirects to afterSignUp', async () => {
        await clerkForProductionInstance.redirectToAfterSignUp();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/');

        await clerkForDevelopmentInstance.redirectToAfterSignUp();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/');
      });

      it('redirects to afterSignIn', async () => {
        await clerkForProductionInstance.redirectToAfterSignIn();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/');

        await clerkForDevelopmentInstance.redirectToAfterSignIn();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/');
      });

      it('redirects to create organization', async () => {
        await clerkForProductionInstance.redirectToCreateOrganization();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/create-organization');

        await clerkForDevelopmentInstance.redirectToCreateOrganization();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/create-organization');
      });

      it('redirects to organization profile', async () => {
        await clerkForProductionInstance.redirectToOrganizationProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/organization-profile');

        await clerkForDevelopmentInstance.redirectToOrganizationProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/organization-profile');
      });
    });

    describe('when redirects point to different origin urls', () => {
      beforeEach(async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            authConfig: { urlBasedSessionSyncing: true } as AuthConfig,
            userSettings: mockUserSettings,
            displayConfig: mockDisplayConfigWithDifferentOrigin,
            isProduction: () => false,
            isDevelopmentOrStaging: () => true,
          }),
        );

        mockUsesUrlBasedSessionSync.mockReturnValue(true);

        clerkForProductionInstance = new Clerk(productionPublishableKey);
        await clerkForProductionInstance.load({
          routerPush: mockNavigate,
        });

        clerkForDevelopmentInstance = new Clerk(developmentPublishableKey);
        await clerkForDevelopmentInstance.load({
          routerPush: mockNavigate,
        });
      });

      afterEach(() => {
        mockEnvironmentFetch.mockRestore();
      });

      it('redirects to signInUrl', async () => {
        await clerkForProductionInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          1,
          'http://another-test.host/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F',
        );

        await clerkForDevelopmentInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F__clerk_db_jwt[deadbeef]',
        );
      });

      it('redirects to signUpUrl', async () => {
        await clerkForProductionInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          1,
          'http://another-test.host/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F',
        );

        await clerkForDevelopmentInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F__clerk_db_jwt[deadbeef]',
        );
      });

      it('redirects to userProfileUrl', async () => {
        await clerkForProductionInstance.redirectToUserProfile();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/user-profile');

        await clerkForDevelopmentInstance.redirectToUserProfile();
        expect(mockHref).toHaveBeenNthCalledWith(2, 'http://another-test.host/user-profile#__clerk_db_jwt[deadbeef]');
      });

      it('redirects to create organization', async () => {
        await clerkForProductionInstance.redirectToCreateOrganization();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/create-organization');

        await clerkForDevelopmentInstance.redirectToCreateOrganization();
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/create-organization#__clerk_db_jwt[deadbeef]',
        );
      });

      it('redirects to organization profile', async () => {
        await clerkForProductionInstance.redirectToOrganizationProfile();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/organization-profile');

        await clerkForDevelopmentInstance.redirectToOrganizationProfile();
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/organization-profile#__clerk_db_jwt[deadbeef]',
        );
      });
    });
  });

  describe('.redirectWithAuth(url)', () => {
    let clerkForProductionInstance: Clerk;
    let clerkForDevelopmentInstance: Clerk;

    beforeEach(async () => {
      mockUsesUrlBasedSessionSync.mockReturnValue(true);
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: { urlBasedSessionSyncing: true } as AuthConfig,
          userSettings: mockUserSettings,
          displayConfig: mockDisplayConfigWithDifferentOrigin,
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }),
      );

      clerkForProductionInstance = new Clerk(productionPublishableKey);
      await clerkForProductionInstance.load({
        routerPush: mockNavigate,
      });

      clerkForDevelopmentInstance = new Clerk(developmentPublishableKey);
      await clerkForDevelopmentInstance.load({
        routerPush: mockNavigate,
      });
    });

    it('redirects to the provided url with __clerk_db_jwt in the url', async () => {
      await clerkForProductionInstance.redirectWithAuth('https://app.example.com');
      expect(mockHref).toHaveBeenNthCalledWith(1, 'https://app.example.com/');

      await clerkForDevelopmentInstance.redirectWithAuth('https://app.example.com');
      expect(mockHref).toHaveBeenNthCalledWith(2, 'https://app.example.com/#__clerk_db_jwt[deadbeef]');
    });
  });
});
