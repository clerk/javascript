import { json, LoaderFunction, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAuth } from '@clerk/remix/ssr.server';
import { createClerkClient } from '@clerk/remix/api.server';
import { ClerkLoaded, SignedIn, UserButton, useUser } from '@clerk/remix';

export const loader: LoaderFunction = async args => {
  args.context['CLERK_API_KEY'];

  const authObject = await getAuth(args);
  const { userId } = authObject;
  if (!userId) {
    return json({ userId: null, count: -1, authObject });
  }

  const clerkClient = createClerkClient({ apiKey: args.context['CLERK_API_KEY'] });
  const { data: count } = await clerkClient.users.getCount();

  console.log('AuthState from loader:', userId);
  return json({ userId: userId, count, authObject });
};

export default function Index() {
  const { user, isLoaded } = useUser();
  const { userId, count, authObject } = useLoaderData();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <pre>{JSON.stringify(authObject)}</pre>
      <div>
        <ul>
          <li>Total users: {count}</li>
          <li>
            ClerkJS client state:
            <ClerkLoaded>
              <div>Client user id: {isLoaded ? user?.id : 'n/a'}</div>
            </ClerkLoaded>
          </li>
          <li>
            ClerkJS server state:
            <SignedIn>
              <div>Server user id: {userId}</div>
              <UserButton />
            </SignedIn>
          </li>
        </ul>
      </div>
    </div>
  );
}
