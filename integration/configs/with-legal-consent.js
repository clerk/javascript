import { defineConfig } from '../presets/platformApplication.js';
import { setupOAuthProvider } from '../presets/setupOAuthProvider.js';

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
    compliance: {
      legal_consent: {
        enabled: true,
        privacy_policy_url: 'http://example.com/privacy',
        terms_of_service_url: 'http://example.com/terms',
      },
    },
  },
  setup: context => setupOAuthProvider(context, { consentScreenEnabled: false }),
});
