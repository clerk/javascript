const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://docs.clerk.dev,
or come say hi in our discord server: https://rebrand.ly/clerk-discord

`;
};

const ssrExample = `Use 'rootAuthLoader' as your root loader. Then, simply use the 'clerkState' from 'useLoaderData'.
export const loader: LoaderFunction = args => rootAuthLoader(args)

export default function App() {
  const { data, clerkState } = useLoaderData();
  <ClerkProvider frontendApi={...} clerkState={clerkState}>
    ...
  </ClerkProvider>
}
`;

export const invalidClerkStatePropError = createErrorMessage(`
You're trying to pass an invalid object in "<ClerkProvider clerkState={...}>".

${ssrExample}
`);

export const notUsingSsrWarning = createErrorMessage(`
You installed Clerk in a Remix project, but it looks like you're not taking full advantage of SSR. If you want to enable SSR, try the following:

${ssrExample}
`);

export const noRequestPassedInGetAuth = createErrorMessage(`
You're calling 'getAuth()' from a loader, without providing the 'request' object.
Example:

export const loader: LoaderFunction = async ({request}) => {
  const { sessionId } = await getAuth(request);
  ...
};
`);

export const invalidRootLoaderCallbackReturn = createErrorMessage(`
You're returning an invalid 'Response' object from the 'rootAuthLoader' in root.tsx.
You can return numbers, strings, objects, booleans, and redirect 'Response' objects (status codes in the range of 300 to 400)
`);
