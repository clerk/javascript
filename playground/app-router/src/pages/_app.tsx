import type { AppProps } from 'next/app';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { Links } from '@/common/Links';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <Links />
      <div style={{ border: '1px solid green', padding: '2rem' }}>
        <h2>Pages</h2>
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
}

export default MyApp;
