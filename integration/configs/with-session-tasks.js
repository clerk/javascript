import { defineConfig } from '../presets/platformApplication.js';
import { setupOAuthProvider } from '../presets/setupOAuthProvider.js';

export default defineConfig({
  config: {
    auth_attack_protection: {
      bot_protection: {
        captcha_enabled: false,
      },
    },
    auth_email: {
      sign_in_strategies: [],
      verify_at_sign_up: false,
    },
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
    session_settings: {
      multi_session_enabled: true,
    },
  },
  setup: context => setupOAuthProvider(context, { consentScreenEnabled: false }),
});
