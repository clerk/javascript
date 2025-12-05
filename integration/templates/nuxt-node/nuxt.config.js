export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
  clerk: {
    appearance: {
      layout: {
        showOptionalFields: true,
      },
    },
  },
  devtools: {
    enabled: false,
  },
});
