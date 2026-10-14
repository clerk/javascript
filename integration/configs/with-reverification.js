import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
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
      verification_strategies: ['phone_code'],
      verify_at_sign_up: true,
    },
    organization_settings: {
      enabled: true,
      force_organization_selection: false,
      slug_disabled: false,
      organization_creation_defaults: {
        enabled: false,
      },
    },
  },
  async setup({ clerkClient }) {
    await clerkClient.organizationRoles.createOrganizationRole({
      key: 'org:viewer',
      name: 'Viewer',
      permissions: [],
    });
  },
});
