import {
  ClientJSON,
  DisplayConfigJSON,
  EnvironmentJSON,
  OAuthProvider,
  SignInJSON,
  UserSettingsJSON,
} from '@clerk/types';

import { createUserFixture } from './fixtures';

export const createEnvironmentFixtureHelpers = (baseEnvironment: EnvironmentJSON) => {
  return {
    ...createAuthConfigFixtureHelpers(baseEnvironment),
    ...createDisplayConfigFixtureHelpers(baseEnvironment),
    ...createOrganizationSettingsFixtureHelpers(baseEnvironment),
    ...createUserSettingsFixtureHelpers(baseEnvironment),
    ...createUserSettingsFixtureHelpers(baseEnvironment),
  };
};

export const createClientFixtureHelpers = (baseClient: ClientJSON) => {
  return { ...createSignInFixtureHelpers(baseClient) };
};

const createSignInFixtureHelpers = (baseClient: ClientJSON) => {
  type SignInWithEmailAddressParams = {
    identifier?: string;
    supportPassword?: boolean;
    supportEmailCode?: boolean;
  };

  const startSignInWithEmailAddress = (params?: SignInWithEmailAddressParams) => {
    const { identifier = 'hello@clerk.dev', supportPassword = true, supportEmailCode } = params || {};
    baseClient.sign_in = {
      status: 'needs_first_factor',
      identifier,
      supported_identifiers: ['email_address'],
      supported_first_factors: [
        ...(supportPassword ? [{ strategy: 'password' }] : []),
        ...(supportEmailCode ? [{ strategy: 'email_code', safe_identifier: 'n*****@clerk.dev' }] : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  return { startSignInWithEmailAddress };
};

const createAuthConfigFixtureHelpers = (environment: EnvironmentJSON) => {
  const ac = environment.auth_config;
  const withMultiSessionMode = () => {
    // TODO:
    ac.single_session_mode = true;
  };
  return { withMultiSessionMode };
};

const createDisplayConfigFixtureHelpers = (environment: EnvironmentJSON) => {
  const dc = environment.display_config;
  const withSupportEmail = (opts?: { email: string }) => {
    dc.support_email = opts?.email || 'support@clerk.dev';
  };
  const withoutClerkBranding = () => {
    dc.branded = false;
  };
  const withPreferredSignInStrategy = (opts: { strategy: DisplayConfigJSON['preferred_sign_in_strategy'] }) => {
    dc.preferred_sign_in_strategy = opts.strategy;
  };
  return { withSupportEmail, withoutClerkBranding, withPreferredSignInStrategy };
};

const createOrganizationSettingsFixtureHelpers = (environment: EnvironmentJSON) => {
  const os = environment.organization_settings;
  const withOrganizations = () => {
    os.enabled = true;
  };
  const withMaxAllowedMemberships = ({ max = 5 }) => {
    os.max_allowed_memberships = max;
  };
  return { withOrganizations, withMaxAllowedMemberships };
};

const createUserSettingsFixtureHelpers = (environment: EnvironmentJSON) => {
  const us = environment.user_settings;
  const emptyAttribute = {
    first_factors: [],
    second_factors: [],
    verifications: [],
    used_for_first_factor: false,
    used_for_second_factor: false,
    verify_at_sign_up: false,
  };

  const withEmailAddress = (opts?: Partial<UserSettingsJSON['attributes']['email_address']>) => {
    us.attributes.email_address = {
      ...emptyAttribute,
      enabled: true,
      required: false,
      used_for_first_factor: true,
      first_factors: ['email_code'],
      used_for_second_factor: false,
      second_factors: [],
      verifications: ['email_code'],
      verify_at_sign_up: true,
      ...opts,
    };
  };

  const withPhoneNumber = (opts?: Partial<UserSettingsJSON['attributes']['phone_number']>) => {
    us.attributes.phone_number = {
      ...emptyAttribute,
      enabled: true,
      required: false,
      used_for_first_factor: true,
      first_factors: ['phone_code'],
      used_for_second_factor: false,
      second_factors: [],
      verifications: ['phone_code'],
      verify_at_sign_up: true,
      ...opts,
    };
  };

  const withUsername = (opts?: Partial<UserSettingsJSON['attributes']['username']>) => {
    us.attributes.username = {
      ...emptyAttribute,
      enabled: true,
      required: false,
      used_for_first_factor: true,
      ...opts,
    };
  };

  const withWeb3Wallet = (opts?: Partial<UserSettingsJSON['attributes']['web3_wallet']>) => {
    us.attributes.web3_wallet = {
      ...emptyAttribute,
      enabled: true,
      required: false,
      used_for_first_factor: true,
      first_factors: ['web3_metamask_signature'],
      verifications: ['web3_metamask_signature'],
      ...opts,
    };
  };

  const withName = (opts?: Partial<UserSettingsJSON['attributes']['first_name']>) => {
    const attr = {
      ...emptyAttribute,
      enabled: true,
      required: false,
      ...opts,
    };
    us.attributes.first_name = attr;
    us.attributes.last_name = attr;
  };

  const withPassword = (opts?: Partial<UserSettingsJSON['attributes']['password']>) => {
    us.attributes.password = {
      ...emptyAttribute,
      enabled: true,
      required: false,
      ...opts,
    };
  };

  const withSocialProvider = (opts: { provider: OAuthProvider; authenticatable?: boolean }) => {
    const { authenticatable = true, provider } = opts || {};
    const strategy = 'oauth_' + provider;
    // @ts-expect-error
    us.social[strategy] = {
      enabled: true,
      authenticatable,
      strategy: strategy,
    };
  };

  // TODO: Add the rest, consult pkg/generate/auth_config.go

  return {
    withEmailAddress,
    withPhoneNumber,
    withUsername,
    withWeb3Wallet,
    withName,
    withPassword,
    withSocialProvider,
  };
};
