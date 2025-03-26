import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    coverage: {
      provider: 'v8',
    },
    fakeTimers: {
      toFake: ['setTimeout', 'clearTimeout', 'Date'],
    },
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
    poolOptions: {
      workers: {
        miniflare: {
          compatibilityDate: "2024-09-23",
          compatibilityFlags: ["nodejs_compat"]
        }
      },
    },
  },
});