import type { EnvironmentJSON } from '@clerk/types';

import { Environment } from '../internal';

describe('Environment', () => {
  it('has the same initial properties', () => {
    const environmentJSON = {
      object: 'environment',
      id: '',
      auth_config: { object: 'auth_config', id: '', single_session_mode: true, claimed_at: null },
      display_config: {
        object: 'display_config',
        id: 'display_config_DUMMY_ID',
        instance_environment_type: 'development',
        application_name: '',
        theme: {
          buttons: { font_color: '#ffffff', font_family: 'sans-serif', font_weight: '600' },
          general: {
            color: '#6c47ff',
            padding: '1em',
            box_shadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            font_color: '#151515',
            font_family: 'sans-serif',
            border_radius: '0.5em',
            background_color: '#ffffff',
            label_font_weight: '600',
          },
          accounts: { background_color: '#ffffff' },
        },
        preferred_sign_in_strategy: 'password',
        logo_image_url: '',
        favicon_image_url: '',
        home_url: '',
        sign_in_url: '',
        sign_up_url: '',
        user_profile_url: '',
        after_sign_in_url: '',
        after_sign_up_url: '',
        after_sign_out_one_url: '',
        after_sign_out_all_url: '',
        after_switch_session_url: '',
        branded: true,
        captcha_public_key: null,
        captcha_widget_type: null,
        captcha_provider: null,
        captcha_public_key_invisible: null,
        captcha_oauth_bypass: [],
        captcha_heartbeat: false,
        support_email: '',
        clerk_js_version: '5',
        organization_profile_url: '',
        create_organization_url: '',
        after_leave_organization_url: '',
        after_create_organization_url: '',
        google_one_tap_client_id: null,
        show_devmode_warning: true,
        terms_url: null,
        privacy_policy_url: null,
        waitlist_url: '',
        after_join_waitlist_url: '',
      },
      user_settings: {
        social: {
          oauth_google: {
            enabled: true,
            required: false,
            authenticatable: true,
            block_email_subaddresses: true,
            strategy: 'oauth_google',
            not_selectable: false,
            deprecated: false,
            name: 'Google',
            logo_url: 'https://img.clerk.com/static/google.png',
          },
        },
        saml: { enabled: false },
        attributes: {
          email_address: {
            enabled: true,
            required: true,
            used_for_first_factor: true,
            first_factors: ['email_code'],
            used_for_second_factor: false,
            second_factors: [],
            verifications: ['email_code'],
            verify_at_sign_up: true,
            name: 'email_address',
          },
          phone_number: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'phone_number',
          },
          username: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'username',
          },
          web3_wallet: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'web3_wallet',
          },
          first_name: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'first_name',
          },
          last_name: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'last_name',
          },
          password: {
            enabled: true,
            required: true,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'password',
          },
          authenticator_app: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'authenticator_app',
          },
          ticket: {
            enabled: true,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'ticket',
          },
          backup_code: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'backup_code',
          },
          passkey: {
            enabled: false,
            required: false,
            used_for_first_factor: false,
            first_factors: [],
            used_for_second_factor: false,
            second_factors: [],
            verifications: [],
            verify_at_sign_up: false,
            name: 'passkey',
          },
        },
        actions: { delete_self: true, create_organization: true, create_organizations_limit: null },
        sign_in: { second_factor: { required: false } },
        sign_up: {
          captcha_enabled: false,
          captcha_widget_type: 'smart',
          custom_action_required: false,
          progressive: true,
          mode: 'public',
          legal_consent_enabled: false,
        },
        password_settings: {
          disable_hibp: false,
          min_length: 8,
          max_length: 72,
          require_special_char: false,
          require_numbers: false,
          require_uppercase: false,
          require_lowercase: false,
          show_zxcvbn: false,
          min_zxcvbn_strength: 0,
          enforce_hibp_on_sign_in: true,
          allowed_special_characters: '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~',
        },
        passkey_settings: { allow_autofill: true, show_sign_in_button: true },
      },
      organization_settings: {
        enabled: false,
        max_allowed_memberships: 5,
        actions: { admin_delete: true },
        domains: { enabled: false, enrollment_modes: [], default_role: null },
      },
      maintenance_mode: false,
    } as unknown as EnvironmentJSON;

    const environment = new Environment(environmentJSON);

    expect(environment).toMatchSnapshot();
  });
});
