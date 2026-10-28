import type {
  ApiKeyJSON,
  AttributeDataJSON,
  AttributesJSON,
  ClientJSON,
  DisplayConfigJSON,
  EmailAddressJSON,
  EnterpriseAccountConnectionJSON,
  EnterpriseAccountJSON,
  EnterpriseConnectionJSON,
  ExternalAccountJSON,
  NativeSettingsJSON,
  OAuthProviderSettings,
  OAuthStrategy,
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationSuggestionJSON,
  PasskeyJSON,
  PasskeySettingsData,
  PasswordSettingsData,
  PermissionJSON,
  PhoneNumberJSON,
  PublicKeyCredentialRequestOptionsJSON,
  PublicOrganizationDataJSON,
  RoleJSON,
  SessionActivityJSON,
  SessionJSON,
  SessionTask,
  SessionVerificationJSON,
  SignUpData,
  TokenJSON,
  UserJSON,
  UserOrganizationInvitationJSON,
  UserSettingsJSON,
  VerificationJSON,
  Web3Strategy,
  Web3WalletJSON,
} from '@clerk/shared/types';

interface Timestamps {
  created_at: number;
  updated_at: number;
}

interface Enabled {
  enabled: boolean;
}

export type FapiToken = Omit<TokenJSON, 'id'>;

export type FapiEmailAddress = EmailAddressJSON & Timestamps & { reserved: boolean };

export type FapiPhoneNumber = PhoneNumberJSON & Timestamps & { reserved: boolean };

export type FapiWeb3Wallet = Web3WalletJSON & Timestamps;

export type FapiExternalAccount = ExternalAccountJSON & Timestamps;

export type FapiUser = Omit<
  UserJSON,
  | 'profile_image_id'
  | 'create_organizations_limit'
  | 'timezone'
  | 'email_addresses'
  | 'phone_numbers'
  | 'web3_wallets'
  | 'external_accounts'
> & {
  email_addresses: FapiEmailAddress[];
  phone_numbers: FapiPhoneNumber[];
  web3_wallets: FapiWeb3Wallet[];
  external_accounts: FapiExternalAccount[];
  saml_accounts: unknown[];
  create_organizations_limit?: number;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  verification_attempts_remaining: number | null;
  last_active_at: number | null;
  mfa_enabled_at: number | null;
  mfa_disabled_at: number | null;
};

export type FapiSession = Omit<SessionJSON, 'user' | 'last_active_token' | 'factor_verification_age' | 'tasks'> & {
  user: FapiUser;
  last_active_token: FapiToken | null;
  factor_verification_age: [firstFactorAge: number, secondFactorAge: number];
  tasks?: SessionTask[];
};

export type FapiSessionActivity = SessionActivityJSON & { is_mobile: boolean };

export type FapiActiveSession = Omit<FapiSession, 'user'> & {
  user: null;
  latest_activity: FapiSessionActivity;
};

export type FapiClient = Omit<ClientJSON, 'sessions' | 'captcha_bypass'> & {
  sessions: FapiSession[];
  captcha_bypass: boolean;
};

export type FapiSessionReverification = Omit<SessionVerificationJSON, 'object' | 'session'> & {
  object: 'session_reverification';
  session: FapiSession;
};

export type FapiRole = RoleJSON & { is_creator_eligible: boolean };

export type FapiOrganizationInvitation = OrganizationInvitationJSON & {
  url: string | null;
  expires_at: number | null;
};

export type FapiUserInvitation = UserOrganizationInvitationJSON & {
  role_name: string;
  url: string | null;
  expires_at: number | null;
};

type FapiAttributeName = keyof AttributesJSON | 'ticket';

type FapiAttribute = Omit<AttributeDataJSON, 'first_factors' | 'immutable'> & {
  first_factors: Array<AttributeDataJSON['first_factors'][number] | Web3Strategy>;
  immutable: boolean;
};

export type FapiSocial = OAuthProviderSettings & {
  block_email_subaddresses: boolean;
  not_selectable: boolean;
  deprecated: boolean;
};

export interface FapiUserSettings {
  attributes: Record<FapiAttributeName, FapiAttribute>;
  social: Partial<Record<OAuthStrategy, FapiSocial>>;
  saml: Enabled;
  enterprise_sso: UserSettingsJSON['enterprise_sso'];
  sign_in: { second_factor: { required: boolean } };
  sign_up: Omit<SignUpData, 'allowlist_only'> & {
    captcha_widget_type: 'smart' | 'invisible';
    custom_action_required: boolean;
  };
  restrictions: Record<
    | 'allowlist'
    | 'blocklist'
    | 'allowlist_blocklist_disabled_on_sign_in'
    | 'block_email_subaddresses'
    | 'block_disposable_email_domains',
    Enabled
  >;
  password_settings: PasswordSettingsData & {
    disable_password_reverification: boolean;
    enforce_hibp_on_sign_in: boolean;
  };
  username_settings: {
    min_length: number;
    max_length: number;
    allow_extended_special_characters: boolean;
    allow_numeric_usernames: boolean;
  };
  actions: UserSettingsJSON['actions'] & { create_organizations_limit: boolean | null };
  attack_protection: {
    user_lockout: Enabled & { max_attempts: number; duration_in_minutes: number };
    pii: Enabled;
    email_link: { require_same_client: boolean };
    enumeration_protection: Enabled;
  };
  passkey_settings: PasskeySettingsData & { satisfies_second_factor: boolean };
}

type FieldSetting = 'on' | 'off' | 'required';

export interface FapiAuthConfig {
  object: 'auth_config';
  id: string;
  first_name: FieldSetting;
  last_name: FieldSetting;
  email_address: FieldSetting;
  phone_number: FieldSetting;
  username: FieldSetting;
  password: FieldSetting;
  identification_requirements: string[][];
  identification_strategies: string[];
  first_factors: string[];
  second_factors: string[];
  email_address_verification_strategies: string[];
  single_session_mode: boolean;
  enhanced_email_deliverability: boolean;
  test_mode: boolean;
  url_based_session_syncing: boolean;
  claimed_at: number | null;
  reverification: boolean;
  native_settings: NativeSettingsJSON;
}

export type FapiDisplayConfig = Omit<
  DisplayConfigJSON,
  'captcha_oauth_bypass' | 'clerk_js_version' | 'google_one_tap_client_id'
> & {
  captcha_oauth_bypass: OAuthStrategy[];
  oauth_consent_url: string;
  logo_link_url: string;
  experimental_force_oauth_first: boolean;
  clerk_js_version: string | null;
  google_one_tap_client_id: string | null;
  help_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  logo_image: object | null;
  favicon_image: object | null;
};

export interface FapiOrganizationSettings {
  enabled: boolean;
  max_allowed_memberships: number;
  force_organization_selection: boolean;
  actions: { admin_delete: boolean };
  domains: { enabled: boolean; enrollment_modes: string[]; default_role: string };
  slug: { disabled: boolean };
  creator_role: string;
}

export interface FapiApiKeysSettings {
  enabled: boolean;
  user_api_keys_enabled: boolean;
  orgs_api_keys_enabled: boolean;
}

export interface FapiEnvironment {
  maintenance_mode: boolean;
  api_keys_settings: FapiApiKeysSettings;
  auth_config: FapiAuthConfig;
  commerce_settings: {
    billing: {
      stripe_publishable_key: string | null;
      organization: { enabled: boolean; has_paid_plans: boolean };
      user: { enabled: boolean; has_paid_plans: boolean };
    };
  };
  display_config: FapiDisplayConfig;
  organization_settings: FapiOrganizationSettings;
  user_settings: FapiUserSettings;
}

export type FapiAttributeOverrides = Partial<Record<FapiAttributeName, Partial<FapiAttribute>>>;

export interface FapiEnvironmentOverrides {
  api_keys_settings?: Partial<FapiApiKeysSettings>;
  attributes?: FapiAttributeOverrides;
  auth_config?: Partial<FapiAuthConfig>;
  display_config?: Partial<FapiDisplayConfig>;
  organization_settings?: Partial<FapiOrganizationSettings>;
  user_settings?: Partial<FapiUserSettings>;
}

export interface FapiPage<T> {
  data: T[];
  total_count: number;
}

const createdAt = Date.UTC(2026, 0, 1);
const farFuture = Date.UTC(2100, 0, 1);
const unsetFactorAge: [number, number] = [99999, -1];

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function fapiToken(claims: Record<string, unknown> = {}): FapiToken {
  const iat = Math.floor(Date.now() / 1000);
  return {
    object: 'token',
    jwt: [
      base64Url({ alg: 'RS256', typ: 'JWT', kid: 'ins_test' }),
      base64Url({ iat, nbf: iat, exp: iat + 3600, ...claims }),
      'signature',
    ].join('.'),
  };
}

function attribute(overrides: Partial<FapiAttribute> = {}): FapiAttribute {
  return {
    enabled: true,
    required: false,
    immutable: false,
    verifications: [],
    used_for_first_factor: false,
    first_factors: [],
    used_for_second_factor: false,
    second_factors: [],
    verify_at_sign_up: false,
    ...overrides,
  };
}

function attributes(overrides: FapiAttributeOverrides = {}): Record<FapiAttributeName, FapiAttribute> {
  return {
    email_address: attribute({
      verifications: ['email_code'],
      used_for_first_factor: true,
      first_factors: ['email_code'],
      verify_at_sign_up: true,
      ...overrides.email_address,
    }),
    phone_number: attribute({ enabled: false, verifications: ['phone_code'], ...overrides.phone_number }),
    username: attribute(overrides.username),
    first_name: attribute(overrides.first_name),
    last_name: attribute(overrides.last_name),
    password: attribute(overrides.password),
    web3_wallet: attribute({ enabled: false, ...overrides.web3_wallet }),
    authenticator_app: attribute({ enabled: false, ...overrides.authenticator_app }),
    ticket: attribute({ enabled: false, ...overrides.ticket }),
    backup_code: attribute({ enabled: false, ...overrides.backup_code }),
    passkey: attribute({ enabled: false, ...overrides.passkey }),
  };
}

const disabled = { enabled: false };

export function fapiEnvironment(overrides: FapiEnvironmentOverrides = {}): FapiEnvironment {
  return {
    maintenance_mode: false,
    api_keys_settings: {
      enabled: false,
      user_api_keys_enabled: false,
      orgs_api_keys_enabled: false,
      ...overrides.api_keys_settings,
    },
    auth_config: {
      object: 'auth_config',
      id: 'aac_1',
      first_name: 'off',
      last_name: 'off',
      email_address: 'on',
      phone_number: 'off',
      username: 'off',
      password: 'on',
      identification_requirements: [],
      identification_strategies: [],
      first_factors: [],
      second_factors: [],
      email_address_verification_strategies: [],
      single_session_mode: false,
      enhanced_email_deliverability: false,
      test_mode: false,
      url_based_session_syncing: false,
      claimed_at: null,
      reverification: false,
      native_settings: {
        object: 'native_settings',
        api_enabled: false,
        trusted_device_sign_in_enabled: false,
        trusted_device_enrollment_prompt_after_sign_in_enabled: false,
        trusted_device_enrollment_prompt_after_sign_up_enabled: false,
      },
      ...overrides.auth_config,
    },
    commerce_settings: {
      billing: {
        stripe_publishable_key: null,
        organization: { enabled: false, has_paid_plans: false },
        user: { enabled: false, has_paid_plans: false },
      },
    },
    display_config: {
      object: 'display_config',
      id: 'display_config_1',
      after_sign_in_url: '',
      after_sign_out_all_url: '/after-sign-out',
      after_sign_out_one_url: '/after-single-sign-out',
      after_sign_up_url: '',
      after_switch_session_url: '',
      application_name: 'Acme',
      branded: false,
      captcha_public_key: null,
      captcha_widget_type: null,
      captcha_public_key_invisible: null,
      captcha_provider: 'turnstile',
      captcha_oauth_bypass: [],
      clerk_js_version: null,
      experimental_force_oauth_first: false,
      favicon_image: null,
      favicon_url: null,
      google_one_tap_client_id: null,
      help_url: null,
      home_url: '',
      instance_environment_type: 'production',
      logo_image: null,
      logo_link_url: '',
      logo_url: null,
      logo_image_url: '',
      favicon_image_url: '',
      oauth_consent_url: '',
      preferred_sign_in_strategy: 'password',
      sign_in_url: '/sign-in',
      sign_up_url: '/sign-up',
      support_email: '',
      theme: {
        general: {
          color: '#6c47ff',
          background_color: '#ffffff',
          font_family: '',
          font_color: '#000000',
          label_font_weight: '600',
          padding: '1em',
          border_radius: '0.5em',
          box_shadow: 'none',
        },
        buttons: { font_color: '#ffffff', font_family: '', font_weight: '600' },
        accounts: { background_color: '#ffffff' },
      },
      user_profile_url: '/user-profile',
      organization_profile_url: '/organization-profile',
      create_organization_url: '/create-organization',
      after_leave_organization_url: '',
      after_create_organization_url: '',
      show_devmode_warning: false,
      terms_url: '',
      privacy_policy_url: '',
      waitlist_url: '',
      after_join_waitlist_url: '',
      ...overrides.display_config,
    },
    organization_settings: {
      enabled: true,
      max_allowed_memberships: 5,
      force_organization_selection: false,
      actions: { admin_delete: true },
      domains: { enabled: false, enrollment_modes: [], default_role: 'org:member' },
      slug: { disabled: false },
      creator_role: 'org:admin',
      ...overrides.organization_settings,
    },
    user_settings: {
      attributes: attributes(overrides.attributes),
      actions: { delete_self: true, create_organization: true, create_organizations_limit: null },
      social: {},
      saml: disabled,
      enterprise_sso: { enabled: false, self_serve_sso: false, self_serve_directory_sync: false },
      sign_in: { second_factor: { required: false } },
      sign_up: {
        progressive: true,
        captcha_enabled: false,
        captcha_widget_type: 'smart',
        custom_action_required: false,
        mode: 'public',
        legal_consent_enabled: false,
      },
      restrictions: {
        allowlist: disabled,
        blocklist: disabled,
        allowlist_blocklist_disabled_on_sign_in: disabled,
        block_email_subaddresses: disabled,
        block_disposable_email_domains: disabled,
      },
      password_settings: {
        allowed_special_characters: '',
        disable_hibp: false,
        disable_password_reverification: false,
        enforce_hibp_on_sign_in: false,
        min_length: 8,
        max_length: 72,
        require_special_char: false,
        require_numbers: false,
        require_uppercase: false,
        require_lowercase: false,
        show_zxcvbn: false,
        min_zxcvbn_strength: 0,
      },
      passkey_settings: { allow_autofill: false, show_sign_in_button: false, satisfies_second_factor: false },
      username_settings: {
        min_length: 4,
        max_length: 64,
        allow_extended_special_characters: false,
        allow_numeric_usernames: false,
      },
      attack_protection: {
        user_lockout: { enabled: false, max_attempts: 100, duration_in_minutes: 60 },
        pii: disabled,
        email_link: { require_same_client: false },
        enumeration_protection: disabled,
      },
      ...overrides.user_settings,
    },
  };
}

export function fapiSocial(strategy: OAuthStrategy, name: string, overrides: Partial<FapiSocial> = {}): FapiSocial {
  return {
    enabled: true,
    required: false,
    authenticatable: true,
    block_email_subaddresses: false,
    not_selectable: false,
    deprecated: false,
    strategy,
    name,
    logo_url: null,
    ...overrides,
  };
}

export function fapiEmailAddress(
  overrides: Partial<FapiEmailAddress> & Pick<FapiEmailAddress, 'id'>,
): FapiEmailAddress {
  return {
    object: 'email_address',
    email_address: `${overrides.id}@example.com`,
    reserved: false,
    verification: null,
    linked_to: [],
    matches_sso_connection: false,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiExternalAccount(
  overrides: Partial<FapiExternalAccount> & Pick<FapiExternalAccount, 'id' | 'provider'>,
): FapiExternalAccount {
  return {
    object: 'external_account',
    identification_id: overrides.id,
    provider_user_id: 'provider_user_1',
    approved_scopes: 'email',
    email_address: `${overrides.provider}@example.com`,
    first_name: '',
    last_name: '',
    image_url: '',
    username: '',
    phone_number: '',
    public_metadata: {},
    label: '',
    verification: fapiVerification(`oauth_${overrides.provider}`, { status: 'verified' }),
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiSamlLinking(verification: VerificationJSON) {
  return {
    object: 'external_account',
    id: '',
    provider: '',
    identification_id: '',
    provider_user_id: '',
    approved_scopes: '',
    email_address: '',
    email_address_verified: null,
    first_name: '',
    last_name: '',
    avatar_url: '',
    username: null,
    phone_number: null,
    public_metadata: null,
    label: null,
    created_at: 0,
    updated_at: 0,
    verification,
  };
}

export function fapiPhoneNumber(
  overrides: Partial<FapiPhoneNumber> & Pick<FapiPhoneNumber, 'id' | 'phone_number'>,
): FapiPhoneNumber {
  return {
    object: 'phone_number',
    reserved: false,
    reserved_for_second_factor: false,
    default_second_factor: false,
    linked_to: [],
    verification: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiEnterpriseConnection(
  overrides: Partial<EnterpriseConnectionJSON> & Pick<EnterpriseConnectionJSON, 'id'>,
): EnterpriseConnectionJSON {
  return {
    object: 'enterprise_connection',
    name: overrides.id,
    active: true,
    provider: 'saml_okta',
    logo_public_url: null,
    domains: [],
    sync_user_attributes: false,
    disable_additional_identifications: false,
    allow_organization_account_linking: true,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiUser(overrides: Partial<FapiUser> & Pick<FapiUser, 'id'>): FapiUser {
  return {
    object: 'user',
    external_id: null,
    primary_email_address_id: overrides.email_addresses?.[0]?.id ?? null,
    primary_phone_number_id: null,
    primary_web3_wallet_id: null,
    image_url: '',
    has_image: false,
    username: null,
    email_addresses: [],
    phone_numbers: [],
    web3_wallets: [],
    external_accounts: [],
    enterprise_accounts: [],
    saml_accounts: [],
    passkeys: [],
    organization_memberships: [],
    password_enabled: true,
    first_name: null,
    last_name: null,
    totp_enabled: false,
    backup_code_enabled: false,
    two_factor_enabled: false,
    public_metadata: {},
    unsafe_metadata: {},
    banned: false,
    locked: false,
    lockout_expires_in_seconds: null,
    verification_attempts_remaining: null,
    last_sign_in_at: null,
    last_active_at: null,
    mfa_enabled_at: null,
    mfa_disabled_at: null,
    create_organization_enabled: true,
    delete_self_enabled: true,
    legal_accepted_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiEnterpriseAccount(
  overrides: Partial<EnterpriseAccountJSON> & Pick<EnterpriseAccountJSON, 'id'>,
  connection: Partial<EnterpriseAccountConnectionJSON> = {},
): EnterpriseAccountJSON {
  return {
    object: 'enterprise_account',
    active: true,
    email_address: 'sso@example.com',
    enterprise_connection: {
      object: 'enterprise_connection',
      id: 'sso_1',
      active: true,
      allow_idp_initiated: false,
      allow_subdomains: false,
      disable_additional_identifications: true,
      domain: 'example.com',
      logo_public_url: null,
      name: 'Company SSO',
      protocol: 'saml',
      provider: 'saml_okta',
      sync_user_attributes: false,
      allow_organization_account_linking: false,
      created_at: createdAt,
      updated_at: createdAt,
      enterprise_connection_id: 'sso_1',
      ...connection,
    },
    first_name: null,
    last_name: null,
    protocol: 'saml',
    provider: 'saml_okta',
    provider_user_id: null,
    public_metadata: {},
    verification: null,
    last_authenticated_at: null,
    enterprise_connection_id: 'sso_1',
    ...overrides,
  };
}

export function fapiWeb3Wallet(
  overrides: Partial<FapiWeb3Wallet> & Pick<FapiWeb3Wallet, 'id' | 'web3_wallet'>,
): FapiWeb3Wallet {
  return {
    object: 'web3_wallet',
    verification: fapiVerification('web3_metamask_signature', { status: 'verified', attempts: 1, expire_at: 0 }),
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiSession(overrides: Partial<FapiSession> & Pick<FapiSession, 'id' | 'user'>): FapiSession {
  const { user } = overrides;
  const primaryEmail = user.email_addresses.find(email => email.id === user.primary_email_address_id);
  return {
    object: 'session',
    status: 'active',
    factor_verification_age: unsetFactorAge,
    expire_at: farFuture,
    abandon_at: farFuture,
    last_active_at: createdAt,
    last_active_token: fapiToken({ sid: overrides.id, sub: user.id }),
    last_active_organization_id: null,
    actor: null,
    public_user_data: {
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      has_image: user.has_image,
      identifier: user.username ?? primaryEmail?.email_address ?? '',
      user_id: user.id,
    },
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiPasskeyRequestOptions(): PublicKeyCredentialRequestOptionsJSON {
  return {
    allowCredentials: [],
    challenge: 'Y2hhbGxlbmdl',
    rpId: 'clerk.abcef.12345.prod.lclclerk.com',
    timeout: 60000,
    userVerification: 'preferred',
  };
}

const verificationObjects: Record<string, string> = {
  password: 'verification_password',
  email_code: 'verification_otp',
  phone_code: 'verification_otp',
  reset_password_email_code: 'verification_otp',
  reset_password_phone_code: 'verification_otp',
  email_link: 'verification_email_link',
  totp: 'verification_totp',
  backup_code: 'verification_backup_code',
  passkey: 'verification_passkey',
  admin: 'verification_admin',
  ticket: 'verification_ticket',
  saml: 'verification_saml',
  google_one_tap: 'verification_google_one_tap',
};

const verificationObjectPrefixes: ReadonlyArray<[prefix: string, object: string]> = [
  ['from_oauth_', 'verification_from_oauth'],
  ['oauth_', 'verification_oauth'],
  ['web3_', 'verification_web3'],
];

const verificationExtras: Record<string, () => Partial<VerificationJSON>> = {
  passkey: () => ({ nonce: JSON.stringify(fapiPasskeyRequestOptions()) }),
  email_link: () => ({ verified_at_client: '' }),
};

function verificationObject(strategy: string): string {
  const prefixed = verificationObjectPrefixes.find(([prefix]) => strategy.startsWith(prefix));
  return verificationObjects[strategy] ?? prefixed?.[1] ?? 'verification';
}

export function fapiVerification(strategy: string, overrides: Partial<VerificationJSON> = {}): VerificationJSON {
  return {
    object: verificationObject(strategy),
    status: 'unverified',
    strategy,
    attempts: 0,
    expire_at: farFuture,
    ...verificationExtras[strategy]?.(),
    ...overrides,
  } as VerificationJSON;
}

export function fapiSessionVerification(
  session: FapiSession,
  overrides: Partial<FapiSessionReverification> = {},
): FapiSessionReverification {
  return {
    object: 'session_reverification',
    id: `sessverif_${session.id}`,
    status: 'needs_first_factor',
    level: 'first_factor',
    session,
    first_factor_verification: null,
    second_factor_verification: null,
    supported_first_factors: [],
    supported_second_factors: [],
    ...overrides,
  };
}

export function fapiClient(sessions: FapiSession[] = []): FapiClient {
  return {
    object: 'client',
    id: 'client_1',
    sessions,
    sign_in: null,
    sign_up: null,
    last_active_session_id: sessions[0]?.id ?? null,
    last_authentication_strategy: null,
    cookie_expires_at: null,
    captcha_bypass: false,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function fapiOrganization(
  overrides: Partial<OrganizationJSON> & Pick<OrganizationJSON, 'id' | 'name'>,
): OrganizationJSON {
  return {
    object: 'organization',
    image_url: '',
    has_image: false,
    slug: overrides.id,
    public_metadata: {},
    members_count: 1,
    pending_invitations_count: 0,
    admin_delete_enabled: true,
    max_allowed_memberships: 5,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiMembership(
  organization: OrganizationJSON,
  overrides: Partial<OrganizationMembershipJSON> = {},
): OrganizationMembershipJSON {
  return {
    object: 'organization_membership',
    id: `orgmem_${organization.id}`,
    organization,
    permissions: [],
    public_metadata: {},
    role: 'org:member',
    role_name: 'Member',
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiRole(key: string, name: string, permissions: PermissionJSON[] = []): FapiRole {
  return {
    object: 'role',
    id: `role_${key.replace('org:', '')}`,
    key,
    name,
    description: '',
    is_creator_eligible: true,
    permissions,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function publicOrganizationData(organization: OrganizationJSON): PublicOrganizationDataJSON {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    has_image: organization.has_image,
    image_url: organization.image_url,
  };
}

export function fapiInvitation(
  id: string,
  organization: OrganizationJSON,
  overrides: Partial<FapiUserInvitation> = {},
): FapiUserInvitation {
  return {
    object: 'organization_invitation',
    id,
    email_address: '',
    public_organization_data: publicOrganizationData(organization),
    public_metadata: {},
    status: 'pending',
    role: 'org:member',
    role_name: 'Member',
    url: null,
    expires_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiSuggestion(
  id: string,
  organization: OrganizationJSON,
  overrides: Partial<OrganizationSuggestionJSON> = {},
): OrganizationSuggestionJSON {
  return {
    object: 'organization_suggestion',
    id,
    public_organization_data: publicOrganizationData(organization),
    status: 'pending',
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiApiKey(overrides: Partial<ApiKeyJSON> & Pick<ApiKeyJSON, 'id' | 'name' | 'subject'>): ApiKeyJSON {
  return {
    object: 'api_key',
    type: 'api_key',
    scopes: [],
    claims: null,
    revoked: false,
    revocation_reason: null,
    expired: false,
    expiration: null,
    created_by: null,
    description: null,
    last_used_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiApiKeyId(seed: number): string {
  return `ak_${seed.toString(16).padStart(32, '0')}`;
}

export function fapiPage<T>(data: T[], totalCount = data.length): FapiPage<T> {
  return { data, total_count: totalCount };
}

export function fapiPasskey(overrides: Partial<PasskeyJSON> & Pick<PasskeyJSON, 'id'>): PasskeyJSON {
  return {
    object: 'passkey',
    name: 'Laptop',
    verification: null,
    created_at: createdAt,
    updated_at: createdAt,
    last_used_at: null,
    ...overrides,
  };
}
