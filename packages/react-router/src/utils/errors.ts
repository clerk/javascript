const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord
`;
};

const ssrExample = `Use 'rootAuthLoader' as your root loader. Then, add <ClerkProvider> to your app.
Example:

import { rootAuthLoader } from '@clerk/react-router/ssr.server'
import { ClerkProvider } from '@clerk/react-router'

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args)
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
    </ClerkProvider>
  )
}
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

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args)

  // Your code here
}
`);

export const invalidRootLoaderCallbackReturn = createErrorMessage(`
You're returning an invalid response from the 'rootAuthLoader' inside root.tsx.
You can only return plain objects, Responses created using the React Router 'data()'helper or
custom redirect 'Response' instances (status codes in the range of 300 to 400).
If you want to return a primitive value or an array, you can always wrap the response with an object.

Example:

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args, async ({ auth }) => {
    const { userId } = auth;
    const posts = await database.getPostsByUserId(userId);

    return { data: posts }
    // Or
    return data(posts, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })
}
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
You're trying to use Clerk in React Router SPA Mode without providing a Publishable Key.
Please provide the publishableKey prop on the <ClerkProvider> component.

Example:

<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
`);

const middlewareMigrationExample = `To use the new middleware system, you need to:

1. Enable the 'v8_middleware' future flag in your config:

// react-router.config.ts
export default {
  future: {
    v8_middleware: true,
  },
} satisfies Config;

2. Install the clerkMiddleware:

import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server'
import { ClerkProvider } from '@clerk/react-router'

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()]

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args)

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
    </ClerkProvider>
  )
}
`;

export const middlewareMigrationWarning = createErrorMessage(`
'"clerkMiddleware()" not detected.

${middlewareMigrationExample}
`);
