import {
  ClientJSON,
  DisplayConfigJSON,
  EnvironmentJSON,
  OAuthProvider,
  SessionJSON,
  SignInJSON,
  SignUpJSON,
  UserJSON,
  UserSettingsJSON,
} from '@clerk/types';
import { PublicUserDataJSON } from '@clerk/types/src';

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
  return { ...createSignInFixtureHelpers(baseClient), ...createSignUpFixtureHelpers(baseClient) };
};

const createSignInFixtureHelpers = (baseClient: ClientJSON) => {
  type SignInWithEmailAddressParams = {
    identifier?: string;
    supportPassword?: boolean;
    supportEmailCode?: boolean;
    supportEmailLink?: boolean;
  };

  type SignInWithPhoneNumberParams = {
    identifier?: string;
    supportPassword?: boolean;
    supportPhoneCode?: boolean;
  };

  type SignInFactorTwoParams = {
    identifier?: string;
    supportPhoneCode?: boolean;
    supportTotp?: boolean;
    supportBackupCode?: boolean;
  };

  type ActiveSessionParams = {
    first_name?: string;
    last_name?: string;
    identifier?: string;
  };

  const startSignInWithEmailAddress = (params?: SignInWithEmailAddressParams) => {
    const { identifier = 'hello@clerk.dev', supportPassword = true, supportEmailCode, supportEmailLink } = params || {};
    baseClient.sign_in = {
      status: 'needs_first_factor',
      identifier,
      supported_identifiers: ['email_address'],
      supported_first_factors: [
        ...(supportPassword ? [{ strategy: 'password' }] : []),
        ...(supportEmailCode ? [{ strategy: 'email_code', safe_identifier: identifier || 'n*****@clerk.dev' }] : []),
        ...(supportEmailLink ? [{ strategy: 'email_link', safe_identifier: identifier || 'n*****@clerk.dev' }] : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  const startSignInWithPhoneNumber = (params?: SignInWithPhoneNumberParams) => {
    const { identifier = '+301234567890', supportPassword = true, supportPhoneCode } = params || {};
    baseClient.sign_in = {
      status: 'needs_first_factor',
      identifier,
      supported_identifiers: ['phone_number'],
      supported_first_factors: [
        ...(supportPassword ? [{ strategy: 'password' }] : []),
        ...(supportPhoneCode ? [{ strategy: 'phone_code', safe_identifier: '+30********90' }] : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  const startSignInFactorTwo = (params?: SignInFactorTwoParams) => {
    const { identifier = 'hello@clerk.dev', supportPhoneCode = true, supportTotp, supportBackupCode } = params || {};
    baseClient.sign_in = {
      status: 'needs_second_factor',
      identifier,
      supported_identifiers: ['email_address', 'phone_number'],
      supported_second_factors: [
        ...(supportPhoneCode ? [{ strategy: 'phone_code', safe_identifier: identifier || 'n*****@clerk.dev' }] : []),
        ...(supportTotp ? [{ strategy: 'totp', safe_identifier: identifier || 'n*****@clerk.dev' }] : []),
        ...(supportBackupCode ? [{ strategy: 'backup_code', safe_identifier: identifier || 'n*****@clerk.dev' }] : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  const withActiveSessions = (params: ActiveSessionParams[]) => {
    baseClient.sessions = params.map((session, index) => {
      return {
        status: 'active',
        id: index.toString(),
        object: 'session',
        expire_at: new Date('2032-12-17').getTime(),
        abandon_at: new Date('2032-12-17').getTime(),
        last_active_at: new Date().getTime(),
        last_active_token: {
          jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          object: 'token',
        },
        last_active_organization_id: null,
        actor: null,
        user: {
          object: 'user',
          id: index.toString(),
          external_id: index.toString(),
          primary_email_address_id: '',
          primary_phone_number_id: '',
          primary_web3_wallet_id: '',
          profile_image_url: '',
          username: session.identifier || 'email@test.com',
          email_addresses: [],
          phone_numbers: [],
          web3_wallets: [],
          external_accounts: [],
          organization_memberships: [],
          password_enabled: true,
          password: '',
          profile_image_id: '',
          first_name: session.first_name || 'FirstName',
          last_name: session.last_name || 'LastName',
          totp_enabled: true,
          backup_code_enabled: true,
          two_factor_enabled: true,
          public_metadata: {},
          unsafe_metadata: {},
          last_sign_in_at: null,
          updated_at: new Date().getTime(),
          created_at: new Date().getTime(),
        } as UserJSON,
        public_user_data: {
          first_name: session.first_name || 'FirstName',
          last_name: session.last_name || 'LastName',
          profile_image_url: '',
          identifier: session.identifier || 'email@test.com',
          user_id: index.toString(),
        } as PublicUserDataJSON,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON;
    });
  };

  return { startSignInWithEmailAddress, startSignInWithPhoneNumber, startSignInFactorTwo, withActiveSessions };
};

const createSignUpFixtureHelpers = (baseClient: ClientJSON) => {
  type SignUpWithEmailAddressParams = {
    emailAddress?: string;
    supportEmailCode?: boolean;
    supportEmailLink?: boolean;
  };

  type SignUpWithPhoneNumberParams = {
    phoneNumber?: string;
  };

  const startSignUpWithEmailAddress = (params?: SignUpWithEmailAddressParams) => {
    const { emailAddress = 'hello@clerk.dev', supportEmailLink = true, supportEmailCode = true } = params || {};
    baseClient.sign_up = {
      id: 'sua_2HseAXFGN12eqlwARPMxyyUa9o9',
      status: 'missing_requirements',
      email_address: emailAddress,
      verifications: (supportEmailLink || supportEmailCode) && {
        email_address: {
          strategy: (supportEmailLink && 'email_link') || (supportEmailCode && 'email_code'),
        },
      },
    } as SignUpJSON;
  };

  const startSignUpWithPhoneNumber = (params?: SignUpWithPhoneNumberParams) => {
    const { phoneNumber = '+301234567890' } = params || {};
    baseClient.sign_up = {
      id: 'sua_2HseAXFGN12eqlwARPMxyyUa9o9',
      status: 'missing_requirements',
      phone_number: phoneNumber,
    } as SignUpJSON;
  };

  return { startSignUpWithEmailAddress, startSignUpWithPhoneNumber };
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

  const withMagicLink = () => {
    withEmailAddress({ first_factors: ['email_link'], verifications: ['email_link'] });
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
    withMagicLink,
    withPhoneNumber,
    withUsername,
    withWeb3Wallet,
    withName,
    withPassword,
    withSocialProvider,
  };
};
