const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
};

export const noFetchFnCtxPassedInGetAuth = createErrorMessage(`
  You're calling 'getAuth()' from a server function, without providing the request object.
  Example:

  export const someServerFunction = createServerFn({ method: 'GET' }).handler(async () => {
    const request = getWebRequest()
    const auth = getAuth(request);
    ...
  });
  `);

export const clerkMiddlewareNotConfigured = createErrorMessage(`
It looks like you're trying to use Clerk without configuring the middleware.

To fix this, make sure you have the \`clerkMiddleware()\` configured in your \`createStart()\` function in your \`src/start.ts\` file.`);
