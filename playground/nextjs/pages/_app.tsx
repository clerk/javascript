import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ClerkProvider, SignedOut, SignIn } from '@clerk/nextjs';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      frontendApi={'clerk.touching.camel-78.dev.lclclerk.com'}
      clerkJSUrl={'https://js.lclclerk.com/npm/clerk.browser.js'}
      {...pageProps}
    >
      <SignedOut>
        <SignIn />
      </SignedOut>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
