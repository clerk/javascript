import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    auth_attack_protection: {
      bot_protection: {
        captcha_enabled: false,
      },
    },
    auth_password: {
      required: false,
    },
  },
});
