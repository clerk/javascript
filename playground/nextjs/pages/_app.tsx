import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ClerkProvider, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      frontendApi={'clerk.touching.camel-78.dev.lclclerk.com'}
      clerkJSUrl={'https://js.lclclerk.com/npm/clerk.browser.js'}
      {...pageProps}
    >
      <AppBar />
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

const AppBar = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid black',
      }}
    >
      <Link href={'/'}>
        <a>
          <h2>Nextjs Playground</h2>
        </a>
      </Link>
      <UserButton />
      <SignedOut>
        <SignInButton mode={'modal'} />
      </SignedOut>
    </div>
  );
};

export default MyApp;
