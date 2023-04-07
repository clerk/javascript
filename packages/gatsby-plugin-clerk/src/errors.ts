const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
};

export const noFrontendApiError = createErrorMessage(`
You need to add the frontendApi key to your gatsby-config.ts file.
During development, grab the Frontend Api value from the Clerk Dashboard, open gatsby-config.ts and configure the Clerk plugin.
For production apps, please consult the Gatsby documentation on environment variables.
`);
