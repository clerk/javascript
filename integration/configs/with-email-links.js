import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    auth_attack_protection: {
      bot_protection: {
        captcha_enabled: false,
      },
      email_link_require_same_client: false,
    },
    organization_settings: {
      enabled: true,
      force_organization_selection: false,
    },
    auth_email: {
      verification_strategies: ['email_link'],
      sign_in_strategies: ['email_link'],
    },
    auth_password: {
      device_trust: {
        enabled: false,
      },
    },
  },
});
