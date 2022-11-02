import { AttributeData, Attributes, Clerk, EnvironmentResource, OAuthProviders, SignInData } from '@clerk/types';
import { jest } from '@jest/globals';
import React from 'react';

import { ComponentContext, EnvironmentProvider } from '../contexts';
import { CoreClerkContextWrapper } from '../contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from '../customizables';
import { FlowMetadataProvider } from '../elements';
import { RouteContext } from '../router';
import { InternalThemeProvider } from '../styledSystem';

const initialConfig = {
  frontendApi: '',
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
          pathRoot: '',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: '',
          supportedStrategies: [],
        },
        phoneNumber: {
          pathRoot: '',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: '',
          supportedStrategies: [],
        },
        web3Wallet: {
          pathRoot: '',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: '',
          supportedStrategies: [],
        },
        externalAccount: {
          pathRoot: '',
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
        pathRoot: '',
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
        pathRoot: '',
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
} as any; // initialize config

const initialEnvironmentResource = {
  userSettings: {
    id: undefined,
    social: {
      oauth_google: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_google',
      },
    } as OAuthProviders,
    attributes: {
      email_address: {
        enabled: true,
        required: true,
        name: 'email_address',
        verifications: ['email_code'],
        used_for_first_factor: true,
        first_factors: ['email_code'],
        used_for_second_factor: false,
        second_factors: [],
        verify_at_sign_up: true,
      } as AttributeData,
      phone_number: {
        enabled: true,
        required: false,
        name: 'phone_number',
        verifications: ['phone_code'],
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: true,
        second_factors: ['phone_code'],
        verify_at_sign_up: true,
      } as AttributeData,
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
      } as AttributeData,
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
      } as AttributeData,
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
      } as AttributeData,
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
      } as AttributeData,
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
      } as AttributeData,
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
      } as AttributeData,
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
      } as AttributeData,
    } as Attributes,
    signIn: {
      second_factor: {
        required: false,
      },
    } as SignInData,
    signUp: {
      custom_action_required: false,
      disable_hibp: false,
      progressive: true,
    },
    socialProviderStrategies: ['oauth_google'],
    authenticatableSocialStrategies: ['oauth_google'],
    web3FirstFactors: [],
    enabledFirstFactorIdentifiers: ['email_address'],
    instanceIsPasswordBased: true,
    hasValidAuthFactor: true,
    pathRoot: '',
  },
  authConfig: {
    pathRoot: '',
    singleSessionMode: false,
  },
  displayConfig: {
    pathRoot: '',
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
    faviconUrl: null,
    backendHost: '',
    homeUrl: '',
    signInUrl: '',
    signUpUrl: '',
    userProfileUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    afterSignOutOneUrl: '',
    afterSignOutAllUrl: '',
    afterSwitchSessionUrl: '',
    branded: true,
    supportEmail: '',
    clerkJSVersion: null,
    experimental__forceOauthFirst: false,
  },
  isSingleSession: () => false,
  isProduction: () => true,
  onWindowLocationHost: () => true,
} as any as EnvironmentResource;

const createClerkFixture = () => {
  const listeners: any[] = [];

  const client = {};
  const session = {};
  const user = {};
  const organization = {};
  const resources = { client, session, user, organization };
  const addListener = (listener: any) => {
    listeners.push(listener);
    listener(resources);
  };
  const updateMock = () => {
    // how do we create new state?
    const newState = { ...resources };
    listeners.forEach(listener => listener(newState));
  };

  return { mockedClerk: { ...resources, addListener } as Clerk, updateMock };
};

type FParam = {
  withUsername: () => void;
  withEmailAddress: () => void;
  withGoogleOAuth: () => void;
  withAllOAuth: () => void;
  withPhoneCode: () => void;
};

type ConfigFn = (f: FParam) => void;

export const createFixture = (configFn: ConfigFn) => {
  const config = initialConfig;
  const f = {
    withUsername: () => {
      // config.user_settings.username = {
      //   enabled: true,
      //   required: true,
      // };
    },
    withGoogleOauth: () => {
      config.user_settings.social.google_oauth = {
        enabled: true,
        required: true,
      };
    },
  } as any as FParam;
  if (configFn) {
    configFn(f);
  }

  const { mockedClerk, updateMock } = createClerkFixture();

  const MockClerkProvider = (props: any) => {
    const { children } = props;
    return (
      <CoreClerkContextWrapper clerk={config}>
        <EnvironmentProvider value={initialEnvironmentResource}>
          <RouteContext.Provider
            value={{
              basePath: '',
              startPath: '',
              fullPath: '',
              indexPath: '',
              currentPath: '',
              queryString: '',
              queryParams: {},
              getMatchData: jest.fn(),
              matches: jest.fn(),
              baseNavigate: jest.fn(),
              navigate: jest.fn(),
              resolve: jest.fn(() => ({ href: 'test.host' } as any)),
              refresh: jest.fn(),
              params: {},
            }}
          >
            <AppearanceProvider appearanceKey={'signIn'}>
              <FlowMetadataProvider flow={'signIn'}>
                <InternalThemeProvider>
                  <ComponentContext.Provider value={{ componentName: 'SignIn' }}>{children}</ComponentContext.Provider>
                </InternalThemeProvider>
              </FlowMetadataProvider>
            </AppearanceProvider>
          </RouteContext.Provider>
        </EnvironmentProvider>
      </CoreClerkContextWrapper>
    );
  };

  return { MockClerkProvider, updateMock };
};
