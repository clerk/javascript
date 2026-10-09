import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    organization_settings: {
      enabled: true,
      force_organization_selection: false,
    },
    auth_email: {
      sign_in_strategies: [],
    },
    auth_password: {
      device_trust: {
        enabled: false,
      },
    },
    auth_phone: {
      used_for_sign_up: true,
      used_for_second_factor: true,
      verification_strategies: ['phone_code'],
      second_factor_strategies: ['phone_code'],
      verify_at_sign_up: true,
    },
    auth_multi_factor: {
      required_for_sign_up: true,
      authenticator_app: {
        enabled: true,
      },
      backup_code: {
        enabled: true,
      },
    },
  },
});
