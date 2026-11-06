import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    auth_password: {
      device_trust: {
        enabled: false,
      },
    },
    organization_settings: {
      enabled: true,
      force_organization_selection: true,
      slug_disabled: false,
      organization_creation_defaults: {
        enabled: false,
      },
    },
  },
});
