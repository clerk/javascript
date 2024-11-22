const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
};

const ssrExample = `Use 'rootAuthLoader' as your root loader. Then, wrap the App component with ClerkApp and make it the default export.
Example:

import { ClerkApp } from '@clerk/react-router';
import { rootAuthLoader } from '@clerk/react-router/ssr.server';

export const loader: LoaderFunction = args => rootAuthLoader(args)

function App() {
  return (
    <html lang='en'>
      ...
    </html>
  );
}

export default ClerkApp(App, { publishableKey: '...' });
`;

export const invalidClerkStatePropError = createErrorMessage(`
You're trying to pass an invalid object in "<ClerkProvider clerkState={...}>".

${ssrExample}
`);

export const noClerkStateError = createErrorMessage(`
Looks like you didn't pass 'clerkState' to "<ClerkProvider clerkState={...}>".

${ssrExample}
`);

export const noLoaderArgsPassedInGetAuth = createErrorMessage(`
You're calling 'getAuth()' from a loader, without providing the loader args object.
Example:

export const loader: LoaderFunction = async (args) => {
  const { sessionId } = await getAuth(args);
  ...
};
`);

export const invalidRootLoaderCallbackReturn = createErrorMessage(`
You're returning an invalid response from the 'rootAuthLoader' called from the loader in root.tsx.
You can only return plain objects, responses created using the Remix 'json()' and 'redirect()' helpers,
custom redirect 'Response' instances (status codes in the range of 300 to 400),
or custom json 'Response' instances (containing a body that is a valid json string).
If you want to return a primitive value or an array, you can always wrap the response with an object.

Example:

export const loader: LoaderFunction = args => rootAuthLoader(args, ({ auth }) => {
    const { userId } = auth;
    const posts: Post[] = database.getPostsByUserId(userId);

    return json({ data: posts })
    // or
    return new Response(JSON.stringify({ data: posts }), { headers: { 'Content-Type': 'application/json' } });
    // or
    return { data: posts };
})
`);

export const noSecretKeyError = createErrorMessage(`
A secretKey must be provided in order to use SSR and the exports from @clerk/react-router/api.');
If your runtime supports environment variables, you can add a CLERK_SECRET_KEY variable to your config.
Otherwise, you can pass a secretKey parameter to rootAuthLoader or getAuth.
`);

export const satelliteAndMissingProxyUrlAndDomain = createErrorMessage(
  `Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`,
);

export const satelliteAndMissingSignInUrl = createErrorMessage(`
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL.`);

export const publishableKeyMissingErrorInSpaMode = createErrorMessage(`
You're trying to use Clerk in Remix SPA Mode without providing a Publishable Key.
Please provide the publishableKey option on the ClerkApp component.

Example:

export default ClerkApp(App, {
  publishableKey: 'pk_test_XXX'
});
`);
