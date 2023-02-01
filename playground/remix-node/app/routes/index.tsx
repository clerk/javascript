import type { LoaderFunction } from '@remix-run/node';
import { getAuth } from '@clerk/remix/ssr.server';
import { useUser, ClerkLoaded, SignedIn } from '@clerk/remix';

export const loader: LoaderFunction = async args => {
  return getAuth(args);
};

export default function Index() {
  const user = useUser();
  console.log('User:', user);
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target='_blank'
            href='https://remix.run/tutorials/blog'
            rel='noreferrer'
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target='_blank'
            href='https://remix.run/tutorials/jokes'
            rel='noreferrer'
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a
            target='_blank'
            href='https://remix.run/docs'
            rel='noreferrer'
          >
            Remix Docs
          </a>
        </li>
      </ul>
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
