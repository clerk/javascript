import type {
  ClientJSON,
  DisplayConfigJSON,
  EmailAddressJSON,
  EnvironmentJSON,
  ExternalAccountJSON,
  OAuthProvider,
  OrganizationEnrollmentMode,
  OrganizationJSON,
  PhoneNumberJSON,
  SamlAccountJSON,
  SessionJSON,
  SignInJSON,
  SignUpJSON,
  UserJSON,
  UserSettingsJSON,
} from '@clerk/types';
import type { MembershipRole, PublicUserDataJSON } from '@clerk/types';

import { createUser, getOrganizationId } from '../../../core/test/fixtures';
import { createUserFixture } from './fixtures';

export const createEnvironmentFixtureHelpers = (baseEnvironment: EnvironmentJSON) => {
  return {
    ...createAuthConfigFixtureHelpers(baseEnvironment),
    ...createDisplayConfigFixtureHelpers(baseEnvironment),
    ...createOrganizationSettingsFixtureHelpers(baseEnvironment),
    ...createUserSettingsFixtureHelpers(baseEnvironment),
  };
};

export const createClientFixtureHelpers = (baseClient: ClientJSON) => {
  return {
    ...createSignInFixtureHelpers(baseClient),
    ...createSignUpFixtureHelpers(baseClient),
    ...createUserFixtureHelpers(baseClient),
  };
};

const createUserFixtureHelpers = (baseClient: ClientJSON) => {
  type OrgParams = Partial<OrganizationJSON> & { role?: MembershipRole };

  type WithUserParams = Omit<
    Partial<UserJSON>,
    'email_addresses' | 'phone_numbers' | 'external_accounts' | 'saml_accounts' | 'organization_memberships'
  > & {
    email_addresses?: Array<string | Partial<EmailAddressJSON>>;
    phone_numbers?: Array<string | Partial<PhoneNumberJSON>>;
    external_accounts?: Array<OAuthProvider | Partial<ExternalAccountJSON>>;
    saml_accounts?: Array<Partial<SamlAccountJSON>>;
    organization_memberships?: Array<string | OrgParams>;
  };

  const createPublicUserData = (params: WithUserParams) => {
    return {
      first_name: 'FirstName',
      last_name: 'LastName',
      profile_image_url: '',
      image_url: '',
      identifier: 'email@test.com',
      user_id: '',
      ...params,
    } as PublicUserDataJSON;
  };

  const withUser = (params: WithUserParams) => {
    baseClient.sessions = baseClient.sessions || [];

    // set the first organization as active
    let activeOrganization: string | null = null;
    if (params?.organization_memberships?.length) {
      activeOrganization =
        typeof params.organization_memberships[0] === 'string'
          ? params.organization_memberships[0]
          : getOrganizationId(params.organization_memberships[0]);
    }

    const session = {
      status: 'active',
      id: baseClient.sessions.length.toString(),
      object: 'session',
      last_active_organization_id: activeOrganization,
      actor: null,
      user: createUser(params),
      public_user_data: createPublicUserData(params),
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      last_active_token: {
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzB9.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg',
      },
    } as SessionJSON;
    baseClient.sessions.push(session);
  };

  return { withUser };
};

const createSignInFixtureHelpers = (baseClient: ClientJSON) => {
  type SignInWithEmailAddressParams = {
    identifier?: string;
    supportPassword?: boolean;
    supportEmailCode?: boolean;
    supportEmailLink?: boolean;
    supportResetPassword?: boolean;
  };

  type SignInWithPhoneNumberParams = {
    identifier?: string;
    supportPassword?: boolean;
    supportPhoneCode?: boolean;
    supportResetPassword?: boolean;
  };

  type SignInFactorTwoParams = {
    identifier?: string;
    supportPhoneCode?: boolean;
    supportTotp?: boolean;
    supportBackupCode?: boolean;
    supportResetPasswordEmail?: boolean;
    supportResetPasswordPhone?: boolean;
  };

  const startSignInWithEmailAddress = (params?: SignInWithEmailAddressParams) => {
    const {
      identifier = 'hello@clerk.com',
      supportPassword = true,
      supportEmailCode,
      supportEmailLink,
      supportResetPassword,
    } = params || {};
    baseClient.sign_in = {
      status: 'needs_first_factor',
      identifier,
      supported_identifiers: ['email_address'],
      supported_first_factors: [
        ...(supportPassword ? [{ strategy: 'password' }] : []),
        ...(supportEmailCode ? [{ strategy: 'email_code', safe_identifier: identifier || 'n*****@clerk.com' }] : []),
        ...(supportEmailLink ? [{ strategy: 'email_link', safe_identifier: identifier || 'n*****@clerk.com' }] : []),
        ...(supportResetPassword
          ? [
              {
                strategy: 'reset_password_email_code',
                safe_identifier: identifier || 'n*****@clerk.com',
                emailAddressId: 'someEmailId',
              },
            ]
          : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  const startSignInWithPhoneNumber = (params?: SignInWithPhoneNumberParams) => {
    const {
      identifier = '+301234567890',
      supportPassword = true,
      supportPhoneCode,
      supportResetPassword,
    } = params || {};
    baseClient.sign_in = {
      status: 'needs_first_factor',
      identifier,
      supported_identifiers: ['phone_number'],
      supported_first_factors: [
        ...(supportPassword ? [{ strategy: 'password' }] : []),
        ...(supportPhoneCode ? [{ strategy: 'phone_code', safe_identifier: '+30********90' }] : []),
        ...(supportResetPassword
          ? [
              {
                strategy: 'reset_password_phone_code',
                safe_identifier: identifier || '+30********90',
                phoneNumberId: 'someNumberId',
              },
            ]
          : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  const startSignInFactorTwo = (params?: SignInFactorTwoParams) => {
    const {
      identifier = '+30 691 1111111',
      supportPhoneCode = true,
      supportTotp,
      supportBackupCode,
      supportResetPasswordEmail,
      supportResetPasswordPhone,
    } = params || {};
    baseClient.sign_in = {
      status: 'needs_second_factor',
      identifier,
      ...(supportResetPasswordEmail
        ? {
            first_factor_verification: {
              status: 'verified',
              strategy: 'reset_password_email_code',
            },
          }
        : {}),
      ...(supportResetPasswordPhone
        ? {
            first_factor_verification: {
              status: 'verified',
              strategy: 'reset_password_phone_code',
            },
          }
        : {}),
      supported_identifiers: ['email_address', 'phone_number'],
      supported_second_factors: [
        ...(supportPhoneCode ? [{ strategy: 'phone_code', safe_identifier: identifier || 'n*****@clerk.com' }] : []),
        ...(supportTotp ? [{ strategy: 'totp', safe_identifier: identifier || 'n*****@clerk.com' }] : []),
        ...(supportBackupCode ? [{ strategy: 'backup_code', safe_identifier: identifier || 'n*****@clerk.com' }] : []),
      ],
      user_data: { ...(createUserFixture() as any) },
    } as SignInJSON;
  };

  return { startSignInWithEmailAddress, startSignInWithPhoneNumber, startSignInFactorTwo };
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
    const { emailAddress = 'hello@clerk.com', supportEmailLink = true, supportEmailCode = true } = params || {};
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
    ac.single_session_mode = false;
  };
  return { withMultiSessionMode };
};

const createDisplayConfigFixtureHelpers = (environment: EnvironmentJSON) => {
  const dc = environment.display_config;
  const withSupportEmail = (opts?: { email: string }) => {
    dc.support_email = opts?.email || 'support@clerk.com';
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

  const withOrganizationDomains = (modes?: OrganizationEnrollmentMode[]) => {
    os.domains.enabled = true;
    os.domains.enrollment_modes = modes || ['automatic_invitation', 'automatic_invitation', 'manual_invitation'];
  };
  return { withOrganizations, withMaxAllowedMemberships, withOrganizationDomains };
};

const createUserSettingsFixtureHelpers = (environment: EnvironmentJSON) => {
  const us = environment.user_settings;
  us.password_settings = {
    allowed_special_characters: '',
    disable_hibp: false,
    min_length: 8,
    max_length: 999,
    require_special_char: false,
    require_numbers: false,
    require_uppercase: false,
    require_lowercase: false,
    show_zxcvbn: false,
    min_zxcvbn_strength: 0,
  };
  const emptyAttribute = {
    first_factors: [],
    second_factors: [],
    verifications: [],
    used_for_first_factor: false,
    used_for_second_factor: false,
    verify_at_sign_up: false,
  };

  const withPasswordComplexity = (opts?: Partial<UserSettingsJSON['password_settings']>) => {
    us.password_settings = {
      ...us.password_settings,
      ...opts,
    };
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

  const withEmailLink = () => {
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

  const withSaml = () => {
    us.saml = { enabled: true };
  };

  // TODO: Add the rest, consult pkg/generate/auth_config.go

  return {
    withEmailAddress,
    withEmailLink,
    withPhoneNumber,
    withUsername,
    withWeb3Wallet,
    withName,
    withPassword,
    withPasswordComplexity,
    withSocialProvider,
    withSaml,
  };
};
