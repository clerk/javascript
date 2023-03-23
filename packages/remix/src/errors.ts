const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
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

export const noSecretKeyOrApiKeyError = createErrorMessage(`
A secretKey or apiKey must be provided in order to use SSR and the exports from @clerk/remix/api.');
If your runtime supports environment variables, you can add a CLERK_SECRET_KEY or CLERK_API_KEY variable to your config.
Otherwise, you can pass a secretKey parameter to rootAuthLoader or getAuth.
`);

export const noRelativeProxyInSSR = createErrorMessage(
  `Only a absolute URL that starts with https is allowed to be used in SSR`,
);

export const satelliteAndMissingProxyUrlAndDomain = createErrorMessage(
  `Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`,
);

export const satelliteAndMissingSignInUrl = createErrorMessage(
  `Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`,
);
