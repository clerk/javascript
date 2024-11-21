import type { Route } from "./+types/_index";
import { getAuth } from '@clerk/remix/ssr.server';
import { ClerkLoaded, SignedIn, useUser } from '@clerk/remix';
import { Link } from 'react-router';

export async function loader(args: Route.LoaderArgs) {
  return getAuth(args)
}

export default function Index() {
  const user = useUser();
  console.log({ user });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Clerk Remix</h1>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <Link
          to='/sign-in'
          prefetch='intent'
        >
          Sign In
        </Link>{' '}
        <Link to='/sign-up'>Sign Up</Link>{' '}
        <Link
          to='/protected'
          prefetch='intent'
        >
          Protected
        </Link>
      </nav>
      <div>
        <ul>
          <li>
            Clerkjs loaded:
            <ClerkLoaded>
              <h2>yes</h2>
            </ClerkLoaded>
          </li>
          <li>
            SignedIn:
            <SignedIn>Signed In!</SignedIn>
          </li>
        </ul>
      </div>
    </div>
  );
}
