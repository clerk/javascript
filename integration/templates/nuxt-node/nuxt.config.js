export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
  devtools: {
    enabled: false,
  },
  // Only used for E2E tests. Prod will read from env vars automatically
  // without declaring them here.
  runtimeConfig: {
    public: {
      clerk: {
        publishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    },
    clerk: {
      secretKey: process.env.CLERK_SECRET_KEY,
    },
  },
});
