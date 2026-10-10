import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    auth_email: { sign_in_strategies: ['email_code'] },
    auth_multi_factor: { authenticator_app: { enabled: true }, backup_code: { enabled: true } },
    user_model: { first_name: { enabled: true }, last_name: { enabled: true } },
    organization_settings: {
      enabled: true,
      domains_enabled: true,
      domains_enrollment_modes: ['manual_invitation'],
      force_organization_selection: false,
      max_allowed_memberships: 10,
    },
    auth_attack_protection: { bot_protection: { captcha_enabled: false } },
  },
  setup: async ({ clerkClient }) => {
    await clerkClient.instance.update({ testMode: true });
  },
});
