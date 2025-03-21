const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}
  
  For more info, check out the docs: https://clerk.com/docs,
  or come say hi in our discord server: https://clerk.com/discord
  `;
};

export const moduleRegistrationRequired =
  createErrorMessage(`The "@clerk/nuxt" module should be registered before using "getAuth".
Example:

export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
})
`);
