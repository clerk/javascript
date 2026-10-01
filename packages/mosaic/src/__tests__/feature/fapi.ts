import type {
  AttributeDataJSON,
  AttributesJSON,
  AuthConfigJSON,
  ClientJSON,
  DisplayConfigJSON,
  EmailAddressJSON,
  EnvironmentJSON,
  OAuthProviders,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationSettingsJSON,
  OrganizationSuggestionJSON,
  PublicOrganizationDataJSON,
  SessionJSON,
  TokenJSON,
  UserJSON,
  UserOrganizationInvitationJSON,
  UserSettingsJSON,
} from '@clerk/shared/types';

type Settings<T> = Omit<T, 'id' | 'object'>;

export type FapiUserSettings = Omit<Settings<UserSettingsJSON>, 'social'> & { social: Partial<OAuthProviders> };

export type FapiEnvironment = Omit<EnvironmentJSON, 'user_settings' | 'organization_settings'> & {
  user_settings: FapiUserSettings;
  organization_settings: Settings<OrganizationSettingsJSON>;
};

export interface FapiEnvironmentOverrides {
  auth_config?: Partial<AuthConfigJSON>;
  display_config?: Partial<DisplayConfigJSON>;
  organization_settings?: Partial<Settings<OrganizationSettingsJSON>>;
  user_settings?: Partial<FapiUserSettings>;
}

export interface FapiPage<T> {
  data: T[];
  total_count: number;
}

const createdAt = Date.UTC(2026, 0, 1);
const farFuture = Date.UTC(2100, 0, 1);

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function fapiToken(claims: Record<string, unknown> = {}): TokenJSON {
  const iat = Math.floor(Date.now() / 1000);
  return {
    object: 'token',
    id: '',
    jwt: [
      base64Url({ alg: 'RS256', typ: 'JWT', kid: 'ins_test' }),
      base64Url({ iat, nbf: iat, exp: iat + 3600, ...claims }),
      'signature',
    ].join('.'),
  };
}

function attribute(overrides: Partial<AttributeDataJSON> = {}): AttributeDataJSON {
  return {
    enabled: true,
    required: false,
    verifications: [],
    used_for_first_factor: false,
    first_factors: [],
    used_for_second_factor: false,
    second_factors: [],
    verify_at_sign_up: false,
    ...overrides,
  };
}

function attributes(): AttributesJSON {
  return {
    email_address: attribute({
      verifications: ['email_code'],
      used_for_first_factor: true,
      first_factors: ['email_code'],
      verify_at_sign_up: true,
    }),
    phone_number: attribute({ enabled: false }),
    username: attribute(),
    first_name: attribute(),
    last_name: attribute(),
    password: attribute(),
    web3_wallet: attribute({ enabled: false }),
    authenticator_app: attribute({ enabled: false }),
    backup_code: attribute({ enabled: false }),
    passkey: attribute({ enabled: false }),
  };
}

export function fapiEnvironment(overrides: FapiEnvironmentOverrides = {}): FapiEnvironment {
  return {
    object: 'environment',
    id: 'env_1',
    maintenance_mode: false,
    api_keys_settings: {
      object: 'api_keys_settings',
      id: 'api_keys_settings_1',
      user_api_keys_enabled: false,
      orgs_api_keys_enabled: false,
    },
    auth_config: {
      object: 'auth_config',
      id: 'aac_1',
      single_session_mode: false,
      claimed_at: null,
      reverification: false,
      ...overrides.auth_config,
    },
    commerce_settings: {
      object: 'commerce_settings',
      id: 'commerce_settings_1',
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
      captcha_oauth_bypass: null,
      home_url: '',
      instance_environment_type: 'production',
      logo_image_url: '',
      favicon_image_url: '',
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
      domains: { enabled: false, enrollment_modes: [], default_role: null },
      slug: { disabled: false },
      organization_creation_defaults: { enabled: false },
      ...overrides.organization_settings,
    },
    user_settings: {
      attributes: attributes(),
      actions: { delete_self: true, create_organization: true },
      social: {},
      enterprise_sso: { enabled: false, self_serve_sso: false, self_serve_directory_sync: false },
      sign_in: { second_factor: { required: false, enabled: false } },
      sign_up: {
        allowlist_only: false,
        progressive: true,
        captcha_enabled: false,
        mode: 'public',
        legal_consent_enabled: false,
      },
      password_settings: {
        allowed_special_characters: '',
        disable_hibp: false,
        min_length: 8,
        max_length: 72,
        require_special_char: false,
        require_numbers: false,
        require_uppercase: false,
        require_lowercase: false,
        show_zxcvbn: false,
        min_zxcvbn_strength: 0,
      },
      passkey_settings: { allow_autofill: false, show_sign_in_button: false },
      username_settings: { min_length: 4, max_length: 64 },
      ...overrides.user_settings,
    },
    protect_config: { object: 'protect_config', id: 'protect_config_1' },
  };
}

export function fapiEmailAddress(
  overrides: Partial<EmailAddressJSON> & Pick<EmailAddressJSON, 'id'>,
): EmailAddressJSON {
  return {
    object: 'email_address',
    email_address: `${overrides.id}@example.com`,
    verification: null,
    linked_to: [],
    matches_sso_connection: false,
    ...overrides,
  };
}

export function fapiUser(overrides: Partial<UserJSON> & Pick<UserJSON, 'id'>): UserJSON {
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
    passkeys: [],
    organization_memberships: [],
    password_enabled: true,
    profile_image_id: '',
    first_name: null,
    last_name: null,
    totp_enabled: false,
    backup_code_enabled: false,
    two_factor_enabled: false,
    public_metadata: {},
    unsafe_metadata: {},
    last_sign_in_at: null,
    create_organization_enabled: true,
    create_organizations_limit: null,
    delete_self_enabled: true,
    legal_accepted_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

export function fapiSession(overrides: Partial<SessionJSON> & Pick<SessionJSON, 'id' | 'user'>): SessionJSON {
  const { user } = overrides;
  const primaryEmail = user.email_addresses.find(email => email.id === user.primary_email_address_id);
  return {
    object: 'session',
    status: 'active',
    factor_verification_age: null,
    expire_at: farFuture,
    abandon_at: farFuture,
    last_active_at: createdAt,
    last_active_token: fapiToken({ sid: overrides.id, sub: user.id }),
    last_active_organization_id: null,
    actor: null,
    tasks: null,
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

export function fapiClient(sessions: SessionJSON[] = []): ClientJSON {
  return {
    object: 'client',
    id: 'client_1',
    sessions,
    sign_in: null,
    sign_up: null,
    last_active_session_id: sessions[0]?.id ?? null,
    last_authentication_strategy: null,
    cookie_expires_at: null,
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
  overrides: Partial<UserOrganizationInvitationJSON> = {},
): UserOrganizationInvitationJSON {
  return {
    object: 'organization_invitation',
    id,
    email_address: '',
    public_organization_data: publicOrganizationData(organization),
    public_metadata: {},
    status: 'pending',
    role: 'org:member',
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

export function fapiPage<T>(data: T[], totalCount = data.length): FapiPage<T> {
  return { data, total_count: totalCount };
}
