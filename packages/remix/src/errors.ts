const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://docs.clerk.dev,
or come say hi in our discord server: https://rebrand.ly/clerk-discord

`;
};

const ssrExample = `Use 'rootAuthLoader' as your root loader. Then, simply wrap the App component with ClerkApp and make it the default export.
Example:

import { ClerkApp } from '@clerk/remix';
import { rootAuthLoader } from '@clerk/remix/ssr.server';

export const loader: LoaderFunction = args => rootAuthLoader(args)

function App() {
  return (
    <html lang='en'>
      ...
    </html>
  );
}

export default ClerkApp(App, { frontendApi: '...' });
`;

export const invalidClerkStatePropError = createErrorMessage(`
You're trying to pass an invalid object in "<ClerkProvider clerkState={...}>".

${ssrExample}
`);

export const noClerkStateError = createErrorMessage(`
Looks like you didn't pass 'clerkState' to "<ClerkProvider clerkState={...}>".

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

export const invalidRootLoaderCallbackResponseReturn = createErrorMessage(`
You're returning an invalid 'Response' object from the 'rootAuthLoader' in root.tsx.
You can return numbers, strings, objects, booleans, and redirect 'Response' objects (status codes in the range of 300 to 400)
`);

export const invalidRootLoaderCallbackReturn = createErrorMessage(`
You're returning an invalid value from 'rootAuthLoader' in root.tsx.
You can only return plain objects or redirect 'Response' objects (status codes in the range of 300 to 400).
If you want to return a primitive value or an array, wrap the response with an object.
Example:

export const loader: LoaderFunction = args => rootAuthLoader(args, ({ auth }) => {
    const { userId } = auth;
    const posts: Post[] = database.getPostsByUserId(userId);
    return { data: posts };
})
`);
