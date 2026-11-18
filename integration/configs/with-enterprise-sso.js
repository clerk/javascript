import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    organization_settings: {
      enabled: true,
      force_organization_selection: false,
    },
  },
});
