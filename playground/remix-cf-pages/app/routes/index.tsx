import { json, LoaderFunction, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAuth } from '@clerk/remix/ssr.server';
import { createClerkClient } from '@clerk/remix/api.server';
import { ClerkLoaded, SignedIn, UserButton, useUser } from '@clerk/remix';

export const loader: LoaderFunction = async args => {
  const authObject = await getAuth(args);
  // const { userId } = authObject;
  // if (!userId) {
  //   return json({ userId: null, count: -1, authObject });
  // }

  // const clerkClient = createClerkClient({ apiKey: args.context['CLERK_API_KEY'] });
  // const { data: count } = await clerkClient.users.getCount();

  // console.log('AuthState from loader:', userId);
  return json(authObject);
};

export default function Index() {
  const { user, isLoaded } = useUser();
  const authObject = useLoaderData();
  const { userId, count } = authObject;

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
          MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5h4wScqCNJZlgm7ppX6lYr61ImMA8IL1wS2LuwXPxtSdQ+zauaOOkSVOyjef1RH1mHcjnOrYGg8NiRMziiH1NUSQhC2kKlnW69Q1wKG+mbcPpUfEaTRLidsGVUaunRPm2GbdRtQAL9ONgad8ze4NEt3E5Lf5Y+5klfl0D2LBgAWpfYcEcMri1+zp417q1Uz2DnnnZ6cxSGxMdD+avB5kETDLRWPcpaWqb83kLDD6kZGxM6Yawk0PMy/0worhc5VLlv1omgsTlFHN+oasV2EvMPPNkyDsTqc2siSVXT4sjmZimQ4kaaXqwfkZreH2woikxwE6YlSzC+kH2DRkXlttpQIDAQAB
          <li>
            ClerkJS server state:
            <div>Server user id: {userId}</div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </li>
        </ul>
      </div>
    </div>
  );
}
