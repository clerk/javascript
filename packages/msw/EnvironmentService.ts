import type { EnvironmentJSON } from '@clerk/shared/types';

// For mocking, we allow flexibility while adhering to the general EnvironmentJSON structure
export interface EnvironmentPreset {
  config: Omit<EnvironmentJSON, 'user_settings'> & {
    user_settings: Partial<Omit<EnvironmentJSON['user_settings'], 'attributes' | 'social'>> & {
      attributes: EnvironmentJSON['user_settings']['attributes'];
      social?: any; // Allow partial OAuth providers for mocking
    };
    meta?: any; // Allow extra metadata for mocking
  };
  description: string;
  id: string;
  name: string;
}

const singleSessionEnvironment: EnvironmentPreset = {
  config: {
    api_keys_settings: {
      enabled: false,
      id: 'api_keys_settings_1',
      object: 'api_keys_settings',
    },
    auth_config: {
      claimed_at: null,
      id: 'aac_single',
      object: 'auth_config',
      preferred_channels: {},
      reverification: false,
      single_session_mode: true,
    },
    commerce_settings: {
      billing: {
        organization: {
          enabled: false,
          has_paid_plans: false,
        },
        stripe_publishable_key: '',
        user: {
          enabled: false,
          has_paid_plans: false,
        },
      },
      id: 'commerce_settings_1',
      object: 'commerce_settings',
    },
    display_config: {
      after_create_organization_url: '',
      after_join_waitlist_url: '',
      after_leave_organization_url: '',
      after_sign_in_url: '',
      after_sign_out_all_url: '',
      after_sign_out_one_url: '',
      after_sign_up_url: '',
      after_switch_session_url: '',
      application_name: 'Acme Co',
      branded: true,
      captcha_oauth_bypass: null,
      captcha_provider: 'turnstile',
      captcha_public_key: null,
      captcha_public_key_invisible: null,
      captcha_widget_type: 'invisible',
      create_organization_url: '',
      favicon_image_url: '',
      home_url: 'https://example.com',
      id: 'display_config_1',
      instance_environment_type: 'production',
      logo_image_url: '',
      object: 'display_config',
      organization_profile_url: '',
      preferred_sign_in_strategy: 'password',
      privacy_policy_url: '',
      show_devmode_warning: false,
      sign_in_url: '',
      sign_up_url: '',
      support_email: '',
      terms_url: '',
      theme: {
        buttons: { font_color: '#000000', font_family: '', font_weight: '' },
        general: {
          background_color: '#ffffff',
          border_radius: '',
          box_shadow: '',
          color: '#000000',
          font_color: '#000000',
          font_family: '',
          label_font_weight: '',
          padding: '',
        },
        accounts: { background_color: '#ffffff' },
      },
      user_profile_url: '',
      waitlist_url: '',
    },
    id: 'env_single_session',
    maintenance_mode: false,
    meta: { responseHeaders: { country: 'us' } },
    object: 'environment',
    organization_settings: {
      actions: {
        admin_delete: true,
      },
      domains: {
        default_role: null,
        enabled: false,
        enrollment_modes: [],
      },
      enabled: false,
      force_organization_selection: false,
      id: undefined as never,
      max_allowed_memberships: 0,
      object: undefined as never,
      slug: {
        disabled: false,
      },
    },
    user_settings: {
      attributes: {
        email_address: {
          enabled: true,
          first_factors: ['email_code'],
          required: true,
          second_factors: ['totp', 'backup_code'],
          used_for_first_factor: true,
          used_for_second_factor: false,
          verifications: ['email_code'],
          verify_at_sign_up: true,
        },
        phone_number: {
          enabled: true,
          first_factors: ['phone_code'],
          required: false,
          second_factors: ['phone_code', 'totp', 'backup_code'],
          used_for_first_factor: true,
          used_for_second_factor: true,
          verifications: ['phone_code'],
          verify_at_sign_up: false,
        },
        web3_wallet: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        username: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        first_name: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        last_name: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        password: {
          enabled: true,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        authenticator_app: {
          enabled: true,
          first_factors: [],
          required: false,
          second_factors: ['totp'],
          used_for_first_factor: false,
          used_for_second_factor: true,
          verifications: [],
          verify_at_sign_up: false,
        },
        backup_code: {
          enabled: true,
          first_factors: [],
          required: false,
          second_factors: ['backup_code'],
          used_for_first_factor: false,
          used_for_second_factor: true,
          verifications: [],
          verify_at_sign_up: false,
        },
        passkey: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
      },
      enterprise_sso: {
        enabled: false,
      },
      passkey_settings: {
        allow_autofill: false,
        show_sign_in_button: false,
      },
      saml: {
        enabled: false,
      },
      sign_in: {
        second_factor: {
          enabled: false,
          required: false,
        },
      },
      sign_up: {
        allowlist_only: false,
        captcha_enabled: false,
        legal_consent_enabled: false,
        mode: 'public',
        progressive: false,
      },
      social: {
        oauth_google: {
          authenticatable: true,
          enabled: true,
          logo_url: 'https://img.clerk.com/static/google.png',
          name: 'Google',
          required: false,
          strategy: 'oauth_google',
        },
      },
    },
  },
  description: 'Single session mode environment',
  id: 'single-session',
  name: 'Single Session',
};

const multiSessionEnvironment: EnvironmentPreset = {
  config: {
    api_keys_settings: {
      enabled: false,
      id: 'api_keys_settings_1',
      object: 'api_keys_settings',
    },
    auth_config: {
      claimed_at: null,
      id: 'aac_multi',
      object: 'auth_config',
      preferred_channels: {},
      reverification: false,
      single_session_mode: false,
    },
    commerce_settings: {
      billing: {
        organization: {
          enabled: false,
          has_paid_plans: false,
        },
        stripe_publishable_key: '',
        user: {
          enabled: true,
          has_paid_plans: true,
        },
      },
      id: 'commerce_settings_1',
      object: 'commerce_settings',
    },
    display_config: {
      after_create_organization_url: '',
      after_join_waitlist_url: '',
      after_leave_organization_url: '',
      after_sign_in_url: '',
      after_sign_out_all_url: '',
      after_sign_out_one_url: '',
      after_sign_up_url: '',
      after_switch_session_url: '',
      application_name: 'Acme Co',
      branded: true,
      captcha_oauth_bypass: null,
      captcha_provider: 'turnstile',
      captcha_public_key: null,
      captcha_public_key_invisible: null,
      captcha_widget_type: 'invisible',
      create_organization_url: '',
      favicon_image_url: '',
      home_url: 'https://example.com',
      id: 'display_config_1',
      instance_environment_type: 'production',
      logo_image_url: '',
      object: 'display_config',
      organization_profile_url: '',
      preferred_sign_in_strategy: 'password',
      privacy_policy_url: '',
      show_devmode_warning: false,
      sign_in_url: '',
      sign_up_url: '',
      support_email: '',
      terms_url: '',
      theme: {
        buttons: { font_color: '#000000', font_family: '', font_weight: '' },
        general: {
          background_color: '#ffffff',
          border_radius: '',
          box_shadow: '',
          color: '#000000',
          font_color: '#000000',
          font_family: '',
          label_font_weight: '',
          padding: '',
        },
        accounts: { background_color: '#ffffff' },
      },
      user_profile_url: '',
      waitlist_url: '',
    },
    id: 'env_multi_session',
    maintenance_mode: false,
    meta: { responseHeaders: { country: 'us' } },
    object: 'environment',
    organization_settings: {
      actions: {
        admin_delete: false,
      },
      domains: {
        default_role: 'org:member',
        enabled: true,
        enrollment_modes: ['manual_invitation', 'automatic_invitation', 'automatic_suggestion'],
      },
      enabled: true,
      force_organization_selection: false,
      id: undefined as never,
      max_allowed_memberships: 3,
      object: undefined as never,
      slug: {
        disabled: false,
      },
    },
    user_settings: {
      actions: {
        create_organization: true,
        delete_self: true,
      },
      attributes: {
        email_address: {
          enabled: true,
          first_factors: ['email_code'],
          required: true,
          second_factors: ['totp', 'backup_code'],
          used_for_first_factor: true,
          used_for_second_factor: false,
          verifications: ['email_code'],
          verify_at_sign_up: true,
        },
        phone_number: {
          enabled: true,
          first_factors: ['phone_code'],
          required: false,
          second_factors: ['phone_code', 'totp', 'backup_code'],
          used_for_first_factor: true,
          used_for_second_factor: true,
          verifications: ['phone_code'],
          verify_at_sign_up: false,
        },
        web3_wallet: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        username: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        first_name: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        last_name: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        password: {
          enabled: true,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
        authenticator_app: {
          enabled: true,
          first_factors: [],
          required: false,
          second_factors: ['totp'],
          used_for_first_factor: false,
          used_for_second_factor: true,
          verifications: [],
          verify_at_sign_up: false,
        },
        backup_code: {
          enabled: true,
          first_factors: [],
          required: false,
          second_factors: ['backup_code'],
          used_for_first_factor: false,
          used_for_second_factor: true,
          verifications: [],
          verify_at_sign_up: false,
        },
        passkey: {
          enabled: false,
          first_factors: [],
          required: false,
          second_factors: [],
          used_for_first_factor: false,
          used_for_second_factor: false,
          verifications: [],
          verify_at_sign_up: false,
        },
      },
      enterprise_sso: {
        enabled: false,
      },
      passkey_settings: {
        allow_autofill: false,
        show_sign_in_button: false,
      },
      saml: {
        enabled: false,
      },
      sign_in: {
        second_factor: {
          enabled: false,
          required: false,
        },
      },
      sign_up: {
        allowlist_only: false,
        captcha_enabled: false,
        legal_consent_enabled: false,
        mode: 'public',
        progressive: false,
      },
      social: {
        oauth_google: {
          authenticatable: true,
          enabled: true,
          logo_url: 'https://img.clerk.com/static/google.png',
          name: 'Google',
          required: false,
          strategy: 'oauth_google',
        },
        oauth_github: {
          authenticatable: true,
          enabled: true,
          logo_url: 'https://img.clerk.com/static/github.png',
          name: 'GitHub',
          required: false,
          strategy: 'oauth_github',
        },
      },
    },
  },
  description: 'Multi-session mode environment with billing enabled',
  id: 'multi-session',
  name: 'Multi Session',
};

export class EnvironmentService {
  static readonly MULTI_SESSION = multiSessionEnvironment;
  static readonly SINGLE_SESSION = singleSessionEnvironment;

  static getEnvironment(id: string): EnvironmentPreset | undefined {
    const environments = [this.SINGLE_SESSION, this.MULTI_SESSION];
    return environments.find(i => i.id === id);
  }

  static listEnvironments(): EnvironmentPreset[] {
    return [this.SINGLE_SESSION, this.MULTI_SESSION];
  }
}
