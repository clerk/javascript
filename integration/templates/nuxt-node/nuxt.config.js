export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@clerk/nuxt'],
  clerk: {
    appearance: {
      options: {
        showOptionalFields: true,
      },
    },
  },
  devtools: {
    enabled: false,
  },
});
