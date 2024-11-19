export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
  // The code below is only necessary in our test environment.
  // Env vars are automatically read by Nuxt. See https://nuxt.com/docs/guide/going-further/runtime-config
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
