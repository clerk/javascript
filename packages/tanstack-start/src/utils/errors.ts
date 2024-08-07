const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
};

export const noFetchFnCtxPassedInGetAuth = createErrorMessage(`
  You're calling 'getAuth()' from a server function, without providing the ctx object.
  Example:

  export const someServerFunction = createServerFn('GET', async (_payload, ctx) => {
    const auth = getAuth(ctx);
    ...
  });
  `);
