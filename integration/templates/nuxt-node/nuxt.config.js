export default defineNuxtConfig({
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
