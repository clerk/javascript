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
    auth_passkey: {
      used_for_sign_in: true,
    },
  },
});
