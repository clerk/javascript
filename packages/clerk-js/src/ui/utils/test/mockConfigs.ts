import { Clerk, EnvironmentResource } from '@clerk/types';
import { jest } from '@jest/globals';

import { RouteContextValue } from '../../router';

const initialMockClerkConfig: Clerk = {
  frontendApi: 'test.host',
  organization: undefined,
  user: null,
  session: null,
  addListener: jest.fn(),
  client: {
    pathRoot: '/client',
    sessions: [],
    signUp: {
      pathRoot: '/client/sign_ups',
      status: null,
      requiredFields: [],
      optionalFields: [],
      missingFields: [],
      unverifiedFields: [],
      verifications: {
        emailAddress: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: 'test.host',
          supportedStrategies: [],
        },
        phoneNumber: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: 'test.host',
          supportedStrategies: [],
        },
        web3Wallet: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: 'test.host',
          supportedStrategies: [],
        },
        externalAccount: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
        },
      },
      username: null,
      firstName: null,
      lastName: null,
      emailAddress: null,
      phoneNumber: null,
      web3wallet: null,
      hasPassword: false,
      unsafeMetadata: {},
      createdSessionId: null,
      createdUserId: null,
      abandonAt: null,
    },
    signIn: {
      pathRoot: '/client/sign_ins',
      status: null,
      supportedIdentifiers: [],
      supportedFirstFactors: [],
      supportedSecondFactors: [],
      firstFactorVerification: {
        pathRoot: 'test.host',
        status: null,
        strategy: null,
        nonce: null,
        externalVerificationRedirectURL: null,
        attempts: null,
        expireAt: null,
        error: null,
        verifiedAtClient: null,
      },
      secondFactorVerification: {
        pathRoot: 'test.host',
        status: null,
        strategy: null,
        nonce: null,
        externalVerificationRedirectURL: null,
        attempts: null,
        expireAt: null,
        error: null,
        verifiedAtClient: null,
      },
      identifier: null,
      createdSessionId: null,
      userData: {},
    },
    lastActiveSessionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: 'client_2GLpcZTwM08TAm7RCDFrfekjbCO',
  },
} as any as Clerk;

const initialMockEnvironmentResource: EnvironmentResource = {
  userSettings: {
    id: undefined,
    social: {
      oauth_google: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_google',
      },
    },
    attributes: {
      email_address: {
        enabled: false,
        required: false,
        name: 'email_address',
        verifications: ['email_code'],
        used_for_first_factor: false,
        first_factors: ['email_code'],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      phone_number: {
        enabled: false,
        required: false,
        name: 'phone_number',
        verifications: ['phone_code'],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: ['phone_code'],
        verify_at_sign_up: false,
      },
      username: {
        enabled: false,
        required: false,
        name: 'username',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      first_name: {
        enabled: true,
        required: true,
        name: 'first_name',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      last_name: {
        enabled: true,
        required: true,
        name: 'last_name',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      password: {
        enabled: true,
        required: true,
        name: 'password',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      web3_wallet: {
        enabled: false,
        required: false,
        name: 'web3_wallet',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      authenticator_app: {
        enabled: false,
        required: false,
        name: 'authenticator_app',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
      backup_code: {
        enabled: false,
        required: false,
        name: 'backup_code',
        verifications: [],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: false,
      },
    },
    signIn: {
      second_factor: {
        required: false,
      },
    },
    signUp: {
      custom_action_required: false,
      disable_hibp: false,
      progressive: true,
    },
    socialProviderStrategies: [],
    authenticatableSocialStrategies: [],
    web3FirstFactors: [],
    enabledFirstFactorIdentifiers: [],
    instanceIsPasswordBased: true,
    hasValidAuthFactor: true,
    pathRoot: 'test.host',
  },
  authConfig: {
    pathRoot: 'test.host',
    singleSessionMode: false,
  },
  displayConfig: {
    pathRoot: 'test.host',
    id: 'display_config_2GLnHgZkgHLIp5F3ciLxw1jdRrX',
    instanceEnvironmentType: 'production',
    applicationName: 'ClerkProd-(local)',
    theme: {
      buttons: {
        font_color: '#ffffff',
        font_family: '"Source Sans Pro", sans-serif',
        font_weight: '600',
      },
      general: {
        color: '#6c47ff',
        padding: '1em',
        box_shadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        font_color: '#151515',
        font_family: '"Source Sans Pro", sans-serif',
        border_radius: '0.5em',
        background_color: '#ffffff',
        label_font_weight: '600',
      },
      accounts: {
        background_color: '#ffffff',
      },
    },
    preferredSignInStrategy: 'password',
    logoUrl: 'https://images.clerk.services/clerk/logo.svg',
    faviconUrl: 'test.host',
    backendHost: 'test.host',
    homeUrl: 'test.host',
    signInUrl: 'test.host',
    signUpUrl: 'test.host',
    userProfileUrl: 'test.host',
    afterSignInUrl: 'test.host',
    afterSignUpUrl: 'test.host',
    afterSignOutOneUrl: 'test.host',
    afterSignOutAllUrl: 'test.host',
    afterSwitchSessionUrl: 'test.host',
    branded: true,
    supportEmail: 'test@host',
    clerkJSVersion: undefined,
    experimental__forceOauthFirst: false,
  },
  isSingleSession: jest.fn(),
  isProduction: jest.fn(),
  onWindowLocationHost: jest.fn(),
} as any as EnvironmentResource;

export const initialRouteContextValue: RouteContextValue = {
  basePath: 'test.host',
  startPath: 'test.host',
  fullPath: 'test.host',
  indexPath: 'test.host',
  currentPath: 'test.host',
  queryString: 'test.host',
  queryParams: {},
  getMatchData: jest.fn(),
  matches: jest.fn(),
  baseNavigate: jest.fn(),
  navigate: jest.fn(),
  resolve: jest.fn(() => ({ href: 'test.host' } as any)),
  refresh: jest.fn(),
  params: {},
};

const initialFixtureConfig = {
  environment: {
    enabledFirstFactorIdentifiers: [],
    social: [],
  },
  user: {},
  client: {},
};

export const getInitialFixtureConfig = () => JSON.parse(JSON.stringify(initialFixtureConfig));
export const getInitialMockClerkConfig = () => {
  const config = JSON.parse(JSON.stringify(initialMockClerkConfig));
  config.getMatchData = jest.fn();
  config.matches = jest.fn();
  config.baseNavigate = jest.fn();
  config.navigate = jest.fn();
  config.resolve = jest.fn(() => ({ href: 'test.host' } as any));
  config.refresh = jest.fn();
  return config;
};
export const getInitialRouteContextValue = () => {
  const config = JSON.parse(JSON.stringify(initialMockClerkConfig));
  config.addListener = jest.fn();
  config.createdAt = new Date().toISOString();
  config.updatedAt = new Date().toISOString();
  return config;
};
export const getInitialEnvironmentResource = () => {
  const config = JSON.parse(JSON.stringify(initialMockEnvironmentResource));
  config.isSingleSession = jest.fn();
  config.isProduction = jest.fn();
  config.onWindowLocationHost = jest.fn();
  return config;
};
