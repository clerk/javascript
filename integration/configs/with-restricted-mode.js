import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    auth_attack_protection: {
      bot_protection: {
        captcha_enabled: false,
      },
    },
    organization_settings: {
      enabled: true,
      force_organization_selection: false,
    },
    auth_access_control: {
      sign_up_mode: 'restricted',
    },
    auth_password: {
      device_trust: {
        enabled: false,
      },
    },
  },
});
